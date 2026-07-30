import { requireRole } from "@/lib/auth/current-user";
import { getOrCreateMyContactProfile } from "@/lib/actions/profile";
import { ensureContactPhotosMigrated } from "@/lib/actions/profile-photos";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const trainer = await requireRole("ADMIN");
  const profileContact = await getOrCreateMyContactProfile();
  const photos = await ensureContactPhotosMigrated(profileContact.id);
  const primaryUrl = photos[0]?.url ?? profileContact.photoUrl ?? trainer.photoUrl;

  return (
    <ProfileView
      profile={{
        contactId: profileContact.id,
        firstName: profileContact.firstName,
        lastName: profileContact.lastName,
        username: trainer.username,
        photoUrl: primaryUrl,
        isClient: profileContact.isClient,
        phone: profileContact.phone,
        about: profileContact.about,
        tag: profileContact.tag,
        dateOfBirth: profileContact.dateOfBirth
          ? profileContact.dateOfBirth.toISOString()
          : null,
        heightCm: profileContact.heightCm,
        weightKg: profileContact.weightKg,
        gender: profileContact.gender,
        photos,
      }}
    />
  );
}
