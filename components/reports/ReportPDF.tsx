'use client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @react-pdf/renderer ships its own JSX runtime
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Permit, AuditEntry } from '@/lib/types';

const S = StyleSheet.create({
  page:        { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', backgroundColor: '#ffffff' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: '#f59e0b' },
  company:     { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  docTitle:    { fontSize: 9, color: '#666', marginTop: 2 },
  reportTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#f59e0b', textAlign: 'right' },
  generated:   { fontSize: 7, color: '#9ca3af', marginTop: 2, textAlign: 'right' },
  section:     { marginBottom: 14 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 2 },
  tableRow:    { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cell:        { fontSize: 8, color: '#374151' },
  hCell:       { fontSize: 8, color: '#374151', fontFamily: 'Helvetica-Bold' },
  footer:      { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 4 },
  kpiRow:      { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard:     { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 10 },
  kpiValue:    { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  kpiLabel:    { fontSize: 7, color: '#9ca3af', marginTop: 2 },
});

function Header({ title }: { title: string }) {
  const now = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  return (
    <View style={S.header}>
      <View>
        <Text style={S.company}>Al-Noor Refinery — ePTW</Text>
        <Text style={S.docTitle}>Electronic Permit to Work System</Text>
      </View>
      <View>
        <Text style={S.reportTitle}>{title}</Text>
        <Text style={S.generated}>Generated: {now}</Text>
      </View>
    </View>
  );
}

function Footer({ title }: { title: string }) {
  return (
    <View style={S.footer} fixed>
      <Text>Al-Noor Refinery ePTW · {title}</Text>
      <Text>CONFIDENTIAL — Authorised personnel only</Text>
    </View>
  );
}

// ─── Daily Permit Report ─────────────────────────────────────

function DailyReportDoc({ permits, date }: { permits: Permit[]; date: string }) {
  const active    = permits.filter(p => p.status === 'ACTIVE').length;
  const approved  = permits.filter(p => p.status === 'APPROVED').length;
  const closed    = permits.filter(p => p.status === 'CLOSED').length;
  const suspended = permits.filter(p => p.status === 'SUSPENDED').length;

  return (
    <Document title="Daily Permit Report — ePTW" author="Al-Noor Refinery">
      <Page size="A4" style={S.page}>
        <Header title="Daily Permit Report" />

        <View style={S.section}>
          <Text style={S.sectionTitle}>Summary — {date}</Text>
          <View style={S.kpiRow}>
            {[
              { v: permits.length, l: 'Total Permits' },
              { v: active,         l: 'Active' },
              { v: approved,       l: 'Approved / Pending Activation' },
              { v: closed,         l: 'Closed Today' },
            ].map(k => (
              <View key={k.l} style={S.kpiCard}>
                <Text style={S.kpiValue}>{k.v}</Text>
                <Text style={S.kpiLabel}>{k.l}</Text>
              </View>
            ))}
          </View>
          {suspended > 0 && (
            <Text style={{ fontSize: 8, color: '#b45309', fontFamily: 'Helvetica-Bold' }}>
              ⚠  {suspended} permit(s) currently suspended — immediate action required.
            </Text>
          )}
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>Permit Register</Text>
          <View style={S.tableHeader}>
            {['Permit No.', 'Type', 'Title / Location', 'Status', 'Risk', 'Valid To'].map((h, i) => (
              <Text key={h} style={[S.hCell, { flex: i === 2 ? 3 : 1 }]}>{h}</Text>
            ))}
          </View>
          {permits.map(p => (
            <View key={p.id} style={S.tableRow}>
              <Text style={[S.cell, { flex: 1, fontFamily: 'Helvetica-Bold', color: '#f59e0b' }]}>{p.permitNumber}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{p.type.replace(/_/g, ' ')}</Text>
              <Text style={[S.cell, { flex: 3 }]}>{p.title.substring(0, 40)}{p.title.length > 40 ? '…' : ''}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{p.status.replace(/_/g, ' ')}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{p.riskLevel}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{new Date(p.validTo).toLocaleDateString('en-GB')}</Text>
            </View>
          ))}
        </View>

        <Footer title="Daily Permit Report" />
      </Page>
    </Document>
  );
}

// ─── Audit Trail Export ──────────────────────────────────────

function AuditTrailDoc({ entries }: { entries: AuditEntry[] }) {
  return (
    <Document title="Audit Trail Export — ePTW" author="Al-Noor Refinery">
      <Page size="A4" style={S.page}>
        <Header title="Audit Trail Export" />

        <View style={S.section}>
          <Text style={S.sectionTitle}>Tamper-Evident Audit Log ({entries.length} entries)</Text>
          <View style={S.tableHeader}>
            {['Timestamp', 'Action', 'Entity', 'Ref', 'Performed By'].map((h, i) => (
              <Text key={h} style={[S.hCell, { flex: i === 1 ? 2 : 1 }]}>{h}</Text>
            ))}
          </View>
          {entries.map(e => (
            <View key={e.id} style={S.tableRow}>
              <Text style={[S.cell, { flex: 1 }]}>
                {new Date(e.performedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
              <Text style={[S.cell, { flex: 2 }]}>{e.action.replace(/_/g, ' ')}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{e.entity}</Text>
              <Text style={[S.cell, { flex: 1, fontFamily: 'Helvetica-Bold', color: '#f59e0b' }]}>{e.entityRef ?? '—'}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{e.performedBy?.name ?? '—'}</Text>
            </View>
          ))}
        </View>

        <Footer title="Audit Trail Export" />
      </Page>
    </Document>
  );
}

// ─── Weekly Safety Summary ───────────────────────────────────

function WeeklySummaryDoc({ permits }: { permits: Permit[] }) {
  const byType: Record<string, number> = {};
  permits.forEach(p => { byType[p.type] = (byType[p.type] ?? 0) + 1; });

  return (
    <Document title="Weekly Safety Summary — ePTW" author="Al-Noor Refinery">
      <Page size="A4" style={S.page}>
        <Header title="Weekly Safety Summary" />

        <View style={S.section}>
          <Text style={S.sectionTitle}>KPIs — Last 7 Days</Text>
          <View style={S.kpiRow}>
            {[
              { v: permits.length,                                        l: 'Total Permits' },
              { v: permits.filter(p => p.status === 'CLOSED').length,    l: 'Closed' },
              { v: permits.filter(p => p.status === 'SUSPENDED').length, l: 'Suspended' },
              { v: permits.filter(p => p.gasTestRequired).length,        l: 'Gas Tests Required' },
            ].map(k => (
              <View key={k.l} style={S.kpiCard}>
                <Text style={S.kpiValue}>{k.v}</Text>
                <Text style={S.kpiLabel}>{k.l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>Permits by Type</Text>
          <View style={S.tableHeader}>
            <Text style={[S.hCell, { flex: 3 }]}>Type</Text>
            <Text style={[S.hCell, { flex: 1 }]}>Count</Text>
            <Text style={[S.hCell, { flex: 1 }]}>% of Total</Text>
          </View>
          {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <View key={type} style={S.tableRow}>
              <Text style={[S.cell, { flex: 3 }]}>{type.replace(/_/g, ' ')}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{count}</Text>
              <Text style={[S.cell, { flex: 1 }]}>{permits.length > 0 ? ((count / permits.length) * 100).toFixed(1) : '0'}%</Text>
            </View>
          ))}
        </View>

        <Footer title="Weekly Safety Summary" />
      </Page>
    </Document>
  );
}

// ─── Public download helpers ─────────────────────────────────

async function downloadPDF(doc: JSX.Element, filename: string): Promise<void> {
  const blob = await pdf(doc).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDailyReport(permits: Permit[]): Promise<void> {
  const date = new Date().toLocaleDateString('en-GB', { dateStyle: 'long' });
  await downloadPDF(<DailyReportDoc permits={permits} date={date} />, `Daily-Permit-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function downloadWeeklySummary(permits: Permit[]): Promise<void> {
  await downloadPDF(<WeeklySummaryDoc permits={permits} />, `Weekly-Safety-Summary-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function downloadAuditTrail(entries: AuditEntry[]): Promise<void> {
  await downloadPDF(<AuditTrailDoc entries={entries} />, `Audit-Trail-${new Date().toISOString().slice(0, 10)}.pdf`);
}
