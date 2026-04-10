'use client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @react-pdf/renderer ships its own JSX runtime
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Permit } from '@/lib/types';

const styles = StyleSheet.create({
  page:          { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', backgroundColor: '#ffffff' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#f59e0b' },
  headerLeft:    { flex: 1 },
  company:       { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  docTitle:      { fontSize: 10, color: '#666', marginTop: 2 },
  permitNo:      { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#f59e0b' },
  statusBadge:   { marginTop: 4, fontSize: 9, color: '#fff', backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  section:       { marginBottom: 16 },
  sectionTitle:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  row:           { flexDirection: 'row', marginBottom: 4 },
  label:         { width: 130, fontSize: 9, color: '#666' },
  value:         { flex: 1, fontSize: 9, color: '#1a1a1a' },
  flagRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  flag:          { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1 },
  flagGas:       { color: '#3b82f6', borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  flagIso:       { color: '#f97316', borderColor: '#f97316', backgroundColor: '#fff7ed' },
  flagCse:       { color: '#a855f7', borderColor: '#a855f7', backgroundColor: '#faf5ff' },
  signBox:       { borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 4, minHeight: 60 },
  signLabel:     { fontSize: 8, color: '#9ca3af', marginBottom: 16 },
  signLine:      { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginTop: 24, marginBottom: 4 },
  signName:      { fontSize: 8, color: '#6b7280' },
  footer:        { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 6 },
  warningBox:    { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fbbf24', padding: 8, borderRadius: 4, marginBottom: 12 },
  warningText:   { fontSize: 8, color: '#92400e', fontFamily: 'Helvetica-Bold', textAlign: 'center' },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );
}

function PermitDocument({ permit }: { permit: Permit }) {
  const isHotWork = permit.type === 'HOT_WORK';
  const issued    = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <Document title={`${permit.permitNumber} — ePTW`} author="Al-Noor Refinery ePTW">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.company}>Al-Noor Refinery — Electronic Permit to Work</Text>
            <Text style={styles.docTitle}>ePTW System · IEC 62443 Compliant</Text>
          </View>
          <View>
            <Text style={styles.permitNo}>{permit.permitNumber}</Text>
            <Text style={styles.statusBadge}>{permit.status.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        {/* Hot work warning */}
        {isHotWork && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              HOT WORK PERMIT — Fire watch required. Gas test mandatory every 30 minutes.
            </Text>
          </View>
        )}

        {/* Work Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Description</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{permit.title}</Text>
          <Text style={{ fontSize: 9, color: '#555', lineHeight: 1.4 }}>{permit.description}</Text>
        </View>

        {/* Permit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permit Details</Text>
          <InfoRow label="Permit Type"     value={permit.type.replace(/_/g, ' ')} />
          <InfoRow label="Risk Level"      value={permit.riskLevel} />
          <InfoRow label="Location"        value={permit.location} />
          <InfoRow label="Unit / Area"     value={`${permit.unit} · ${permit.area}`} />
          <InfoRow label="Equipment"       value={permit.equipment} />
          <InfoRow label="Valid From"      value={new Date(permit.validFrom).toLocaleString('en-GB')} />
          <InfoRow label="Valid To"        value={new Date(permit.validTo).toLocaleString('en-GB')} />
          <InfoRow label="Workers on Site" value={String(permit.workerCount)} />
          <InfoRow label="SIMOPS Zone"     value={permit.simopsZone || 'N/A'} />
        </View>

        {/* Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsibilities</Text>
          <InfoRow label="Requested By"      value={`${permit.requestedBy.name} (${permit.requestedBy.role.replace(/_/g, ' ')})`} />
          {permit.areaAuthority    && <InfoRow label="Area Authority"    value={`${permit.areaAuthority.name} (${permit.areaAuthority.role.replace(/_/g, ' ')})`} />}
          {permit.issuingAuthority && <InfoRow label="Issuing Authority" value={`${permit.issuingAuthority.name} (${permit.issuingAuthority.role.replace(/_/g, ' ')})`} />}
          {permit.hseOfficer       && <InfoRow label="HSE Officer"       value={`${permit.hseOfficer.name} (${permit.hseOfficer.role.replace(/_/g, ' ')})`} />}
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements & Checks</Text>
          <View style={styles.flagRow}>
            {permit.gasTestRequired    && <Text style={[styles.flag, styles.flagGas]}>GAS TEST REQUIRED</Text>}
            {permit.isolationRequired  && <Text style={[styles.flag, styles.flagIso]}>ISOLATION REQUIRED</Text>}
            {permit.confinedSpaceEntry && <Text style={[styles.flag, styles.flagCse]}>CONFINED SPACE ENTRY</Text>}
          </View>
          <View style={{ marginTop: 8 }}>
            <InfoRow label="JSA Completed"  value={permit.jsaCompleted ? 'Yes' : 'Not yet'} />
            <InfoRow label="Toolbox Talk"   value={permit.toolboxTalkCompleted ? 'Completed' : 'Not yet'} />
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authorisation Signatures</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[
              { role: 'Permit Requester',  name: permit.requestedBy.name },
              { role: 'Issuing Authority', name: permit.issuingAuthority?.name ?? '' },
              { role: 'HSE Officer',       name: permit.hseOfficer?.name ?? '' },
            ].map(s => (
              <View key={s.role} style={[styles.signBox, { flex: 1 }]}>
                <Text style={styles.signLabel}>{s.role}</Text>
                <View style={styles.signLine} />
                <Text style={styles.signName}>{s.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{permit.permitNumber} · Al-Noor Refinery ePTW</Text>
          <Text>Issued: {issued}</Text>
          <Text>CONTROLLED DOCUMENT — Do not photocopy</Text>
        </View>

      </Page>
    </Document>
  );
}

export async function downloadPermitPDF(permit: Permit): Promise<void> {
  const blob = await pdf(<PermitDocument permit={permit} />).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${permit.permitNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
