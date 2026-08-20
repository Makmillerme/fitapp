export const NOTE_TEMPLATE_GOAL = "goal";
export const NOTE_TEMPLATE_CONTRA = "contraindications";

export const NOTE_TEMPLATES = [
  {
    key: NOTE_TEMPLATE_GOAL,
    title: "Ціль",
  },
  {
    key: NOTE_TEMPLATE_CONTRA,
    title: "Протипоказання",
  },
] as const;

export type NoteTemplateKey = (typeof NOTE_TEMPLATES)[number]["key"];
