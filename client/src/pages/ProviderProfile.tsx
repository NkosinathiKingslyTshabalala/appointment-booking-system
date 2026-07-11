import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerService } from "../services/providerService";
import { useAppSelector } from "../hooks/useAppDispatch";

interface ProfileFormData {
  bio: string;
  qualification: string;
}

export default function ProviderProfile() {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ProfileFormData>();

  // Fetch all providers to find this user's profile
  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: providerService.getProviders,
  });

  // Find this provider's profile
  useEffect(() => {
    if (providers && user) {
      const myProfile = providers.find((p) => p.user.id === user.id);
      if (myProfile) {
        setProviderId(myProfile.id);
        reset({ bio: myProfile.bio || "", qualification: myProfile.qualification || "" });
      }
    }
  }, [providers, user, reset]);

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: providerService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setSuccessMessage("Profile created successfully!");
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfileFormData }) =>
      providerService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setSuccessMessage("Profile updated successfully!");
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setSuccessMessage("");
    if (providerId) {
      updateMutation.mutate({ id: providerId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "1.5rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{providerId ? "Update profile" : "Create provider profile"}</h2>

      {successMessage && (
        <p role="status" style={{ color: "green" }}>{successMessage}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            rows={4}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("bio", { required: "Bio is required" })}
          />
          {errors.bio && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.bio.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="qualification">Qualification</label>
          <input
            id="qualification"
            type="text"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("qualification", { required: "Qualification is required" })}
          />
          {errors.qualification && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.qualification.message}
            </span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: 10 }}>
          {isSubmitting ? "Saving..." : providerId ? "Update profile" : "Create profile"}
        </button>
      </form>
    </div>
  );
}