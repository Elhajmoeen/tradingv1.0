import { selectGlobalCustomDocuments } from '@/state/entitiesSlice';

// Extract searchable strings for a record, including FieldKit docs
export function pickSearchStrings(record: any, customDocs: {id: string; name: string}[]) {
  // Build fullName if not present
  const fullName = record.fullName || 
    [record.firstName, record.lastName].filter(Boolean).join(' ') ||
    '';
    
  const base = [
    record.firstName,
    record.lastName,
    fullName,
    record.email,
    record.phoneNumber,
    record.phone2 ? record.phone2.number : record.phoneNumber2,
    record.secondaryPhone,
    record.accountId,
    record.id,
  ].filter(Boolean).map(String);

  // flatten dynamic docs (assuming record.documents: { [docId]: string | number | boolean | null })
  const dyn: string[] = [];
  if (record?.documents && typeof record.documents === 'object') {
    for (const doc of customDocs) {
      const v = record.documents[doc.id];
      if (v != null && v !== '') dyn.push(String(v));
    }
  }

  return { base, dyn };
}

// Extract numeric-only keys for phone-like matching
export function pickDigitStrings(record: any) {
  const phones = [
    record.phoneNumber,
    record.phone2?.number,
    record.phoneNumber2,
    record.secondaryPhone
  ].filter(Boolean).map(String);
  return phones;
}