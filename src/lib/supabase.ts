import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type DemoLead = {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  teamSize: string;
  message?: string;
};

export type OrganizationPayload = {
  name: string;
  document: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  units: string;
};

export type StudentPayload = {
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: string;
  organizationId?: string;
  locationId?: string;
  goal?: string;
};

export async function saveDemoLead(lead: DemoLead) {
  if (!supabase) return { ok: true, offline: true };

  const { error } = await supabase.from('demo_leads').insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    business_type: lead.businessType,
    team_size: lead.teamSize,
    message: lead.message ?? null,
  });

  if (error) throw error;
  return { ok: true, offline: false };
}

export async function saveStudent(student: StudentPayload) {
  if (!supabase) return { ok: true, offline: true };

  const { error } = await supabase.from('students').insert({
    organization_id: student.organizationId ?? null,
    location_id: student.locationId ?? null,
    name: student.name,
    email: student.email,
    phone: student.phone,
    plan: student.plan,
    status: student.status,
    goal: student.goal ?? null,
  });

  if (error) throw error;
  return { ok: true, offline: false };
}

export async function saveOrganization(organization: OrganizationPayload) {
  if (!supabase) return { ok: true, offline: true, id: crypto.randomUUID() };

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: organization.name,
      document: organization.document,
      business_type: organization.businessType,
      owner_name: organization.ownerName,
      email: organization.email,
      phone: organization.phone,
      units_count: Number.parseInt(organization.units, 10) || 1,
    })
    .select('id')
    .single();

  if (error) throw error;

  const { error: locationError } = await supabase.from('locations').insert({
    organization_id: data.id,
    name: 'Unidade principal',
    city: organization.city,
    state: organization.state,
  });

  if (locationError) throw locationError;
  return { ok: true, offline: false, id: data.id as string };
}
