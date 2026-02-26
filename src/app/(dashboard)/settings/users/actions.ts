"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function createUserAction(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  studioId: string;
  instructorId?: string;
}) {
  // Verify the caller is a super_admin
  const serverSupabase = await createServerClient();
  const {
    data: { user: caller },
  } = await serverSupabase.auth.getUser();

  if (!caller) {
    return { error: "Nieautoryzowany" };
  }

  const { data: callerProfile } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "super_admin") {
    return { error: "Brak uprawnien" };
  }

  // Use service role client to create user without email confirmation
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName, role: input.role },
    });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Upsert profile — the on_auth_user_created trigger may or may not have
    // created the row yet, so upsert ensures it always exists with correct data
    await adminSupabase.from("profiles").upsert(
      {
        id: authData.user.id,
        role: input.role,
        full_name: input.fullName,
      },
      { onConflict: "id" }
    );

    // Assign to studio
    if (input.studioId && input.role !== "super_admin") {
      await adminSupabase.from("studio_members").insert({
        profile_id: authData.user.id,
        studio_id: input.studioId,
        role: input.role === "manager" ? "manager" : "instructor",
      });
    }

    // Link to instructor record
    if (input.role === "instructor") {
      if (input.instructorId) {
        // Direct link by ID — used from "Link instructor" flow
        await adminSupabase
          .from("instructors")
          .update({ profile_id: authData.user.id, email: input.email })
          .eq("id", input.instructorId);
      } else if (input.studioId) {
        // Name-match fallback — used from "New user from scratch" flow
        const { data: existingInstructor } = await adminSupabase
          .from("instructors")
          .select("id")
          .eq("studio_id", input.studioId)
          .eq("full_name", input.fullName)
          .is("profile_id", null)
          .eq("is_active", true)
          .maybeSingle();

        if (existingInstructor) {
          await adminSupabase
            .from("instructors")
            .update({ profile_id: authData.user.id, email: input.email })
            .eq("id", existingInstructor.id);
        } else {
          await adminSupabase.from("instructors").insert({
            profile_id: authData.user.id,
            studio_id: input.studioId,
            full_name: input.fullName,
            email: input.email,
          });
        }
      }
    }
  }

  return { error: null };
}

export async function deleteUserAction(profileId: string) {
  // Verify the caller is a super_admin
  const serverSupabase = await createServerClient();
  const {
    data: { user: caller },
  } = await serverSupabase.auth.getUser();

  if (!caller) {
    return { error: "Nieautoryzowany" };
  }

  if (caller.id === profileId) {
    return { error: "Nie mozesz usunac wlasnego konta" };
  }

  const { data: callerProfile } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "super_admin") {
    return { error: "Brak uprawnien" };
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Unlink instructor records (preserves group assignments & history)
  await adminSupabase
    .from("instructors")
    .update({ profile_id: null })
    .eq("profile_id", profileId);

  // Delete studio_members rows
  await adminSupabase
    .from("studio_members")
    .delete()
    .eq("profile_id", profileId);

  // Delete profile row
  await adminSupabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  // Delete auth user
  const { error: authError } =
    await adminSupabase.auth.admin.deleteUser(profileId);

  if (authError) {
    return { error: authError.message };
  }

  return { error: null };
}
