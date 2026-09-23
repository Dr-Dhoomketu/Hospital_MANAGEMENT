import { Router, type IRouter } from "express";
import {
  CreatePatientBody,
  CreatePatientResponse,
  CreatePublicAppointmentBody,
  CreateRevisitAppointmentBody,
  CreateRevisitAppointmentParams,
  CreatePublicAppointmentResponse,
  GetDashboardSummaryResponse,
  GetPatientParams,
  GetPatientResponse,
  GetPatientTimelineParams,
  GetPatientTimelineResponse,
  ListAppointmentsQueryParams,
  ListAppointmentsResponse,
  ListNotificationsResponse,
  ListPatientsQueryParams,
  ListPatientsResponse,
  ListPublicDoctorsQueryParams,
  ListPublicDoctorsResponse,
  ListPublicServicesResponse,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";
import {
  createAppointment,
  createPatient,
  getDashboardSummary,
  getPatient,
  getPatientTimeline,
  listAppointments,
  listDoctors,
  listNotifications,
  listPatients,
  listServices,
  persistAppointmentIfConfigured,
  updateAppointmentStatus,
} from "../lib/hospital-data";
import { sendAppointmentConfirmation } from "../lib/mailer.js";

const router: IRouter = Router();

router.get("/public/services", async (_req, res, next) => {
  try {
    res.json(ListPublicServicesResponse.parse(await listServices()));
  } catch (error) {
    next(error);
  }
});

router.get("/public/doctors", async (req, res, next) => {
  try {
    const query = ListPublicDoctorsQueryParams.parse(req.query);
    res.json(ListPublicDoctorsResponse.parse(await listDoctors(query.department)));
  } catch (error) {
    next(error);
  }
});

router.post("/public/appointments", async (req, res, next) => {
  try {
    const input = CreatePublicAppointmentBody.parse(req.body);
    const appointment = createAppointment({
      ...input,
      scheduledAt: input.scheduledAt.toISOString(),
    });
    await persistAppointmentIfConfigured(appointment);

    // Send confirmation email (fire-and-forget — don't block response)
    sendAppointmentConfirmation({
      ...appointment,
      email: input.email,
    }).catch(() => {});

    res.status(201).json(CreatePublicAppointmentResponse.parse(appointment));
  } catch (error) {
    next(error);
  }
});

router.post("/public/appointments/:id/revisit", async (req, res, next) => {
  try {
    const params = CreateRevisitAppointmentParams.parse(req.params);
    const input = CreateRevisitAppointmentBody.parse(req.body);
    const original = listAppointments().find((appointment) => appointment.id === params.id);
    if (!original) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    const appointment = createAppointment({
      patientName: original.patientName,
      phone: "",
      email: "",
      serviceId:
        original.serviceName === "Cardiology consultation"
          ? "svc-cardiology"
          : "svc-general",
      doctorId: null,
      scheduledAt: input.scheduledAt.toISOString(),
      visitType: "revisit",
      notes: input.notes,
    });
    await persistAppointmentIfConfigured(appointment);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard/summary", (_req, res) => {
  res.json(GetDashboardSummaryResponse.parse(getDashboardSummary()));
});

router.get("/patients", (req, res) => {
  const query = ListPatientsQueryParams.parse(req.query);
  res.json(ListPatientsResponse.parse(listPatients(query.search, query.status)));
});

router.post("/patients", (req, res) => {
  const input = CreatePatientBody.parse(req.body);
  res.status(201).json(
    CreatePatientResponse.parse({
      ...createPatient({
        ...input,
        bloodGroup: input.bloodGroup ?? null,
        dateOfBirth: input.dateOfBirth.toISOString().slice(0, 10),
      }),
    }),
  );
});

router.get("/patients/:id", (req, res) => {
  const params = GetPatientParams.parse(req.params);
  const patient = getPatient(params.id);
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(GetPatientResponse.parse(patient));
});

router.get("/patients/:id/timeline", (req, res) => {
  const params = GetPatientTimelineParams.parse(req.params);
  res.json(GetPatientTimelineResponse.parse(getPatientTimeline(params.id)));
});

router.get("/appointments", (req, res) => {
  const query = ListAppointmentsQueryParams.parse(req.query);
  res.json(
    ListAppointmentsResponse.parse(
      listAppointments(
        query.date ? query.date.toISOString().slice(0, 10) : undefined,
        query.status,
      ),
    ),
  );
});

router.patch("/appointments/:id/status", (req, res) => {
  const params = UpdateAppointmentStatusParams.parse(req.params);
  const input = UpdateAppointmentStatusBody.parse(req.body);
  const appointment = updateAppointmentStatus(params.id, input.status);
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(UpdateAppointmentStatusResponse.parse(appointment));
});

router.get("/notifications", (_req, res) => {
  res.json(ListNotificationsResponse.parse(listNotifications()));
});

export default router;