import { randomUUID } from "node:crypto";
import {
  insertSupabaseRow,
  querySupabase,
} from "./supabase";

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  startingPrice: number | null;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  experienceYears: number;
  available: boolean;
  avatarUrl: string | null;
};

export type Patient = {
  id: string;
  patientNumber: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string | null;
  status: "active" | "inactive";
  createdAt: string;
};

export type Appointment = {
  id: string;
  appointmentNumber: string;
  patientId: string | null;
  patientName: string;
  doctorName: string;
  serviceName: string;
  department: string;
  scheduledAt: string;
  status:
    | "scheduled"
    | "checked_in"
    | "in_consultation"
    | "completed"
    | "cancelled"
    | "no_show";
  visitType: "new" | "follow_up" | "revisit";
  checkInCode: string;
  qrPayload: string;
  notes: string | null;
};

export type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  occurredAt: string;
  doctorName: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "billing" | "clinical" | "system";
  read: boolean;
  createdAt: string;
};

const demoServices: Service[] = [
  {
    id: "svc-cardiology",
    name: "Cardiology consultation",
    category: "Speciality care",
    description: "Heart health consultation with diagnostics guidance.",
    durationMinutes: 30,
    startingPrice: 900,
  },
  {
    id: "svc-general",
    name: "General physician",
    category: "Outpatient care",
    description: "Everyday care for adults and children.",
    durationMinutes: 20,
    startingPrice: 500,
  },
  {
    id: "svc-lab",
    name: "Health screening package",
    category: "Diagnostics",
    description: "A guided set of preventive tests for a complete baseline.",
    durationMinutes: 45,
    startingPrice: 1800,
  },
  {
    id: "svc-orthopedics",
    name: "Orthopaedics consultation",
    category: "Speciality care",
    description: "Assessment and treatment planning for bone and joint health.",
    durationMinutes: 30,
    startingPrice: 800,
  },
];

const demoDoctors: Doctor[] = [
  {
    id: "doc-mehta",
    name: "Dr. Arjun Mehta",
    specialty: "Cardiology",
    department: "Heart & Vascular",
    experienceYears: 18,
    available: true,
    avatarUrl: null,
  },
  {
    id: "doc-iyer",
    name: "Dr. Neha Iyer",
    specialty: "Internal Medicine",
    department: "General Medicine",
    experienceYears: 12,
    available: true,
    avatarUrl: null,
  },
  {
    id: "doc-rao",
    name: "Dr. Sameer Rao",
    specialty: "Orthopaedics",
    department: "Bone & Joint",
    experienceYears: 15,
    available: true,
    avatarUrl: null,
  },
];

const demoPatients: Patient[] = [
  {
    id: "pat-10482",
    patientNumber: "ASH-10482",
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    dateOfBirth: "1988-04-12",
    gender: "Male",
    bloodGroup: "B+",
    status: "active",
    createdAt: "2026-09-20T08:30:00.000Z",
  },
  {
    id: "pat-10483",
    patientNumber: "ASH-10483",
    name: "Maya Kapoor",
    phone: "+91 99887 12001",
    email: "maya.kapoor@example.com",
    dateOfBirth: "1979-11-23",
    gender: "Female",
    bloodGroup: "O+",
    status: "active",
    createdAt: "2026-09-21T11:10:00.000Z",
  },
  {
    id: "pat-10484",
    patientNumber: "ASH-10484",
    name: "Rohan Desai",
    phone: "+91 98220 77710",
    email: "rohan.desai@example.com",
    dateOfBirth: "1994-06-09",
    gender: "Male",
    bloodGroup: "A+",
    status: "active",
    createdAt: "2026-09-22T09:15:00.000Z",
  },
];

const demoAppointments: Appointment[] = [
  {
    id: "apt-24091",
    appointmentNumber: "OPD-24091",
    patientId: "pat-10482",
    patientName: "Aarav Sharma",
    doctorName: "Dr. Arjun Mehta",
    serviceName: "Cardiology consultation",
    department: "Heart & Vascular",
    scheduledAt: "2026-09-23T10:00:00.000Z",
    status: "checked_in",
    visitType: "follow_up",
    checkInCode: "ASH-7K2M",
    qrPayload: "ashoka://check-in/OPD-24091",
    notes: "Bring latest blood pressure log.",
  },
  {
    id: "apt-24092",
    appointmentNumber: "OPD-24092",
    patientId: "pat-10483",
    patientName: "Maya Kapoor",
    doctorName: "Dr. Neha Iyer",
    serviceName: "General physician",
    department: "General Medicine",
    scheduledAt: "2026-09-23T11:30:00.000Z",
    status: "scheduled",
    visitType: "new",
    checkInCode: "ASH-9P4Q",
    qrPayload: "ashoka://check-in/OPD-24092",
    notes: null,
  },
  {
    id: "apt-24093",
    appointmentNumber: "OPD-24093",
    patientId: "pat-10484",
    patientName: "Rohan Desai",
    doctorName: "Dr. Sameer Rao",
    serviceName: "Orthopaedics consultation",
    department: "Bone & Joint",
    scheduledAt: "2026-09-23T14:00:00.000Z",
    status: "in_consultation",
    visitType: "revisit",
    checkInCode: "ASH-4T8N",
    qrPayload: "ashoka://check-in/OPD-24093",
    notes: "Review MRI report.",
  },
];

const demoNotifications: Notification[] = [
  {
    id: "note-1",
    title: "Appointment checked in",
    message: "Aarav Sharma has arrived for Cardiology.",
    type: "appointment",
    read: false,
    createdAt: "2026-09-23T09:48:00.000Z",
  },
  {
    id: "note-2",
    title: "Lab report ready",
    message: "Lipid profile report is ready for review.",
    type: "clinical",
    read: false,
    createdAt: "2026-09-23T08:20:00.000Z",
  },
  {
    id: "note-3",
    title: "Insurance pre-authorisation",
    message: "Two IPD cases are awaiting payer approval.",
    type: "billing",
    read: true,
    createdAt: "2026-09-22T17:05:00.000Z",
  },
];

const timelineByPatient: Record<string, TimelineEvent[]> = {
  "pat-10482": [
    {
      id: "tl-1",
      type: "visit",
      title: "Cardiology follow-up",
      description: "Review of blood pressure and medication plan.",
      occurredAt: "2026-08-21T10:30:00.000Z",
      doctorName: "Dr. Arjun Mehta",
    },
    {
      id: "tl-2",
      type: "lab",
      title: "Lipid profile",
      description: "Report available in medical records.",
      occurredAt: "2026-08-21T12:15:00.000Z",
      doctorName: null,
    },
  ],
};

let dataSourceWarningLogged = false;

async function trySupabase<T>(
  table: string,
  map: (row: Record<string, unknown>) => T,
): Promise<T[] | null> {
  if (process.env.NODE_ENV === "development") return null;
  try {
    const rows = await querySupabase(table, "select=*&limit=100");
    return rows.map(map);
  } catch (error) {
    if (!dataSourceWarningLogged) {
      console.warn(
        "[hospital-data] Supabase schema is not available; returning demo fixtures in this environment.",
        error,
      );
      dataSourceWarningLogged = true;
    }
    return null;
  }
}

export async function listServices(): Promise<Service[]> {
  return (
    (await trySupabase("hospital_services", (row) => ({
      id: String(row.id),
      name: String(row.name),
      category: String(row.category ?? "Hospital service"),
      description: String(row.description ?? ""),
      durationMinutes: Number(row.duration_minutes ?? 30),
      startingPrice:
        row.starting_price === null || row.starting_price === undefined
          ? null
          : Number(row.starting_price),
    }))) ?? demoServices
  );
}

export async function listDoctors(department?: string): Promise<Doctor[]> {
  const doctors =
    (await trySupabase("hospital_doctors", (row) => ({
      id: String(row.id),
      name: String(row.name),
      specialty: String(row.specialty ?? ""),
      department: String(row.department ?? ""),
      experienceYears: Number(row.experience_years ?? 0),
      available: Boolean(row.available ?? true),
      avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    }))) ?? demoDoctors;
  return department
    ? doctors.filter((doctor) =>
        doctor.department.toLowerCase().includes(department.toLowerCase()),
      )
    : doctors;
}

export function listPatients(search?: string, status?: string): Patient[] {
  return demoPatients.filter((patient) => {
    const matchesSearch =
      !search ||
      `${patient.name} ${patient.patientNumber} ${patient.phone}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesSearch && (!status || patient.status === status);
  });
}

export function createPatient(input: Omit<Patient, "id" | "patientNumber" | "createdAt" | "status">): Patient {
  const patient: Patient = {
    ...input,
    id: `pat-${randomUUID().slice(0, 8)}`,
    patientNumber: `ASH-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  demoPatients.unshift(patient);
  return patient;
}

export function getPatient(id: string): Patient | undefined {
  return demoPatients.find((patient) => patient.id === id);
}

export function getPatientTimeline(id: string): TimelineEvent[] {
  return timelineByPatient[id] ?? [];
}

export function listAppointments(date?: string, status?: string): Appointment[] {
  return demoAppointments.filter((appointment) => {
    const matchesDate = !date || appointment.scheduledAt.startsWith(date);
    return matchesDate && (!status || appointment.status === status);
  });
}

export function createAppointment(input: {
  patientName: string;
  phone: string;
  email: string;
  serviceId: string;
  doctorId?: string | null;
  scheduledAt: string;
  visitType: Appointment["visitType"];
  notes?: string | null;
}): Appointment {
  const service =
    demoServices.find((candidate) => candidate.id === input.serviceId) ??
    demoServices[0];
  const doctor =
    demoDoctors.find((candidate) => candidate.id === input.doctorId) ??
    demoDoctors[0];
  const number = Math.floor(25000 + Math.random() * 74999);
  const appointment: Appointment = {
    id: `apt-${number}`,
    appointmentNumber: `OPD-${number}`,
    patientId: null,
    patientName: input.patientName,
    doctorName: doctor.name,
    serviceName: service.name,
    department: doctor.department,
    scheduledAt: input.scheduledAt,
    status: "scheduled",
    visitType: input.visitType,
    checkInCode: `ASH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    qrPayload: `ashoka://check-in/OPD-${number}`,
    notes: input.notes ?? null,
  };
  demoAppointments.unshift(appointment);
  return appointment;
}

export function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Appointment | undefined {
  const appointment = demoAppointments.find((candidate) => candidate.id === id);
  if (appointment) appointment.status = status;
  return appointment;
}

export function listNotifications(): Notification[] {
  return demoNotifications;
}

export function getDashboardSummary() {
  const today = "2026-09-23";
  const todaysAppointments = listAppointments(today);
  const appointmentsByStatus = todaysAppointments.reduce<Record<string, number>>(
    (counts, appointment) => {
      counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
      return counts;
    },
    {},
  );
  return {
    date: today,
    totalPatients: 1248 + demoPatients.length,
    todaysAppointments: todaysAppointments.length,
    pendingAdmissions: 12,
    emergencyCases: 4,
    revenue: 286400,
    occupancy: 78.4,
    appointmentsByStatus,
    recentAppointments: todaysAppointments,
  };
}

export async function persistAppointmentIfConfigured(
  appointment: Appointment,
): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  await insertSupabaseRow("hospital_appointments", {
    id: appointment.id,
    appointment_number: appointment.appointmentNumber,
    patient_name: appointment.patientName,
    doctor_name: appointment.doctorName,
    service_name: appointment.serviceName,
    department: appointment.department,
    scheduled_at: appointment.scheduledAt,
    status: appointment.status,
    visit_type: appointment.visitType,
    check_in_code: appointment.checkInCode,
    qr_payload: appointment.qrPayload,
    notes: appointment.notes,
  });
}