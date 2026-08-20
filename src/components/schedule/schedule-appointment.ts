export type ScheduleAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  location: string | null;
  notes: string | null;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
    photoUrl: string | null;
  };
  program: { id: string; name: string } | null;
};

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Заплановано",
  COMPLETED: "Завершено",
  NO_SHOW: "Неявка",
  CANCELLED: "Скасовано",
};

export function appointmentDurationLabel(start: Date, end: Date) {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} год ${m} хв`;
  if (h) return `${h} год`;
  return `${m} хв`;
}

export function appointmentClientName(appointment: ScheduleAppointment) {
  return `${appointment.client.firstName} ${appointment.client.lastName ?? ""}`.trim();
}
