import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getWidgetById } from "@/lib/apps/widgets";

type Props = {
  params: Promise<{ widgetId: string }>;
};

export default async function WidgetPage({ params }: Props) {
  await requireRole("ADMIN");
  const { widgetId } = await params;
  const widget = getWidgetById(widgetId);

  if (!widget?.available || !widget.Component) {
    notFound();
  }

  const Component = widget.Component;
  return <Component />;
}
