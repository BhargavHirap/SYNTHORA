import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

const MARKETS: Record<string, { name: string; code: string }> = {
  IN: { name: "India", code: "IND" }, US: { name: "United States", code: "USA" },
  GB: { name: "United Kingdom", code: "GBR" }, DE: { name: "Germany", code: "DEU" },
  JP: { name: "Japan", code: "JPN" }, BR: { name: "Brazil", code: "BRA" },
};
const INDICATORS = {
  "SP.POP.TOTL": { label: "Population, total", unit: "people" },
  "NY.GDP.PCAP.CD": { label: "GDP per capita (current US$)", unit: "current US$ per person" },
  "IT.NET.USER.ZS": { label: "Individuals using the Internet", unit: "% of population" },
  "SP.URB.TOTL.IN.ZS": { label: "Urban population", unit: "% of population" },
  "SL.UEM.TOTL.ZS": { label: "Unemployment, total", unit: "% of labour force" },
  "SP.POP.0014.TO.ZS": { label: "Population ages 0–14", unit: "% of total population" },
  "SP.POP.1564.TO.ZS": { label: "Population ages 15–64", unit: "% of total population" },
  "SP.POP.65UP.TO.ZS": { label: "Population ages 65+", unit: "% of total population" },
  "SP.RUR.TOTL.ZS": { label: "Rural population", unit: "% of total population" },
  "SL.TLF.CACT.ZS": { label: "Labour force participation", unit: "% of population ages 15+" },
  "IT.CEL.SETS.P2": { label: "Mobile cellular subscriptions", unit: "per 100 people" },
  "SE.SEC.ENRR": { label: "School enrolment, secondary", unit: "% gross" },
} as const;
type IndicatorCode = keyof typeof INDICATORS;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const requested = (params.get("markets") || "IN,US,GB,DE,JP,BR").split(",").map(x => x.trim().toUpperCase());
  const markets = [...new Set(requested)].filter((x): x is keyof typeof MARKETS => x in MARKETS).slice(0, 6);
  if (!markets.length) return NextResponse.json({ error: "Select at least one supported market." }, { status: 400 });
  const codes = markets.map(x => MARKETS[x].code).join(";");
  const indicators = Object.keys(INDICATORS).join(";");
  const sourceUrl = `https://api.worldbank.org/v2/country/${codes}/indicator/${indicators}?source=2&format=json&mrnev=5&per_page=1000`;
  try {
    const response = await fetch(sourceUrl, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20000), next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`World Bank API returned ${response.status}`);
    const payload = await response.json() as [{ lastupdated?: string; pages?: number; total?: number }, Array<{ countryiso3code?: string; country?: { id?: string; value?: string }; indicator?: { id?: string; value?: string }; date?: string; value?: number | null; unit?: string; obs_status?: string }> | null];
    const meta = payload?.[0] || {};
    const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
    const data = rows.filter(r => r.value !== null && r.value !== undefined && r.indicator?.id && r.countryiso3code).map(r => {
      const market = Object.entries(MARKETS).find(([, v]) => v.code === r.countryiso3code);
      const code = r.indicator!.id as IndicatorCode;
      return {
        id: `${r.countryiso3code}-${code}-${r.date}`,
        market: market?.[0] || r.countryiso3code!, country: r.country?.value || market?.[1].name || r.countryiso3code!,
        indicatorCode: code, indicator: INDICATORS[code]?.label || r.indicator?.value || code,
        year: Number(r.date), value: r.value, unit: INDICATORS[code]?.unit || r.unit || "",
        observationStatus: r.obs_status || "",
      };
    }).sort((a, b) => a.market.localeCompare(b.market) || a.indicatorCode.localeCompare(b.indicatorCode) || b.year - a.year);
    return NextResponse.json({
      provider: "World Bank — World Development Indicators", sourceId: "2", datasetVersion: "SYNTHORA-GLOBAL-2026.1",
      sourceUrl: "https://data.worldbank.org/indicator", apiUrl: sourceUrl,
      lastUpdated: meta.lastupdated || null, retrievedAt: new Date().toISOString(),
      markets: markets.map(code => ({ code, name: MARKETS[code].name })),
      indicators: Object.entries(INDICATORS).map(([code, v]) => ({ code, ...v })),
      data, methodology: "Seven additional demographic, connectivity and labour/education indicators are included alongside the original macroeconomic series. The API returns up to five most recent non-empty observations per indicator and market.", caveat: "Latest available observations are not necessarily from the same year. Missing values are omitted. These country-level indicators are contextual evidence, not individual-level distributions or proof of causation. Gross enrolment can exceed 100%.",
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("SYNTHORA research data fetch failed", error);
    return NextResponse.json({ error: "The public dataset is temporarily unavailable. Please retry shortly." }, { status: 502 });
  }
}
