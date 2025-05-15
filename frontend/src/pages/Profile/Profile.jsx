/**
 * Profile Page Component
 * 
 * This component displays a user's profile where they can:
 * - View their own profile information
 * - Edit their profile information
 * - Change their profile picture and cover image
 * 
 * The page requires user authentication to access content.
 * If a user is not logged in, they will see a message prompting them to sign in.
 */

import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import {
  ArrowLeft,
  Link as LinkIcon,
  CalendarDays,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Dialog component for confirming changes to profile information
const ConfirmDialog = ({ title, message, onConfirm, children }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Dialog component for editing profile information
const EditProfileDialog = ({ onSave }) => {
  const { profile } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    username: profile?.username ?? "",
    bio: profile?.bio ?? "",
    link: profile?.link ?? "",
    currentPassword: "",
    newPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Update form data when profile changes
    setFormData(prev => ({
      ...prev,
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      username: profile?.username ?? "",
      bio: profile?.bio ?? "",
      link: profile?.link ?? "",
    }));
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (formData.currentPassword || formData.newPassword) {
      if (!formData.newPassword) {
        return toast.error("Please enter a new password", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      if (!formData.currentPassword) {
        return toast.error("Please enter your current password", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      if (formData.newPassword.length < 6) {
        return toast.error("New Password must be at least 6 characters", {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
      if (formData.currentPassword === formData.newPassword) {
        return toast.error(
          "New Password must be different from current password", {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
          }
        );
      }

      setShowConfirm(true);
      return;
    }

    await submitForm();
  };

  // Function to submit form data to the server
  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          apiFormData.append(key, value);
        }
      });

      await onSave(apiFormData);
      setIsDialogOpen(false);
    } catch (e) {
      toast.error(e.message || "Failed to update profile", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Link</label>
              <Input
                type="text"
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              type="text"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            {showConfirm ? (
              <ConfirmDialog
                title="Confirm Password Change"
                message="Are you sure you want to change your password?"
                onConfirm={submitForm}
              >
                <Button type="button">
                  {isSubmitting ? <Loader2 size={16} /> : null}
                  Confirm Changes
                </Button>
              </ConfirmDialog>
            ) : (
              <Button type="submit">
                {isSubmitting ? <Loader2 size={16} /> : null}
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Profile = () => {
  // Get required data from AppContext
  const [formData, setFormData] = useState(new FormData());
  const { profile, url, user, setProfile, fetchProfileByUsername, token } = useContext(AppContext);
  const { username } = useParams();
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState({
    profile: false,
    cover: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  // Function to fetch user profile data from the server
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setIsOwner(false);
      setIsLoading(false)
      return;
    }
    try {
      if (!profile || profile.username !== username) {
        const fetchedProfile = await fetchProfileByUsername(username, token);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      toast.error("Failed to load profile", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      })
    } finally {
      setIsLoading(false);
    }
  }, [username, token, fetchProfileByUsername, setProfile]);

  // Check if the current user is the owner of the profile
  useEffect(() => {
    if (user && profile) {
      setIsOwner(user.username === profile.username)
    } else {
      setIsOwner(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Function to handle image uploads for profile picture and cover image
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setIsImageLoading((prev) => ({ ...prev, [type]: true }));
  
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "cover") {
          setCoverImg(reader.result);
        } else {
          setProfileImg(reader.result);
        }
        setHasChanges(true);
      };
      reader.readAsDataURL(file);

      const newFormData = new FormData();
      const key = type === "profile" ? "profileImg" : "coverImg";
      newFormData.append(key, file);
      setFormData(newFormData);
      setHasChanges(true);
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setIsImageLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Function to update profile information on the server
  const handleProfileUpdate = async (updateData) => {

    try {
      const newFormData = new FormData();

      if (formData.get('profileImg')) {
        newFormData.append('profileImg', formData.get('profileImg'));
      }
      if (formData.get('coverImg')) {
        newFormData.append('coverImg', formData.get('coverImg'));
      }

      if (updateData instanceof FormData) {
        for (const [key, value] of updateData.entries()) {
          if (value) {
            newFormData.append(key, value);
          }
        }
      }

      const response = await fetch(`${url}/api/user/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: newFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      toast.success('Profile updated successfully', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      // window.location.reload();
    }
  };

  return (
    <>
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <div className="flex flex-col">
          {isLoading? (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
          ): profile ? (
          <>
            <div className="flex gap-10 px-4 py-2 items-center">
              <Link to="/">
                <ArrowLeft size={24} />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold">{profile.name}</h1>
                <p className="text-gray-500">@{username}</p>
                {/* Amount of post made */}
              </div>
            </div>
            <div className="relative group">
              <div className="relative">
                <img
                  src={coverImg || profile.cover_image || "/cover.png"}
                  className={`h-52 w-full object-cover ${
                    isImageLoading.cover ? "opacity-50" : ""
                  }`}
                  alt="Cover"
                />
                {isImageLoading.cover && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>
              {isOwner && (
                <button
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Edit Cover Image"
                  onClick={() =>
                    !isImageLoading.cover && coverImgRef.current?.click()
                  }
                  disabled={isImageLoading.cover}
                >
                  <Pencil size={16} className="text-white" />
                </button>
              )}
              <div className="absolute bottom-0 left-4 transform translate-y-1/2 group/avatar">
                <div className="relative">
                  <img
                    src={
                      profileImg ||
                      profile.profile_image ||
                      "/avatar-placeholder.png"
                    }
                    className={`h-24 w-24 rounded-full border-4 border-white object-cover ${
                      isImageLoading.profile ? "opcaity-50" : ""
                    }`}
                    alt="Profile avatar"
                  />
                  {isImageLoading.profile && (
                    <div className="asoolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>
                {isOwner && (
                  <button
                    className="absolute bottom-0 right-0 p-2 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                    onClick={() =>
                      !isImageLoading.profile && profileImgRef.current?.click()
                    }
                    disabled={isImageLoading.profile}
                  >
                    <Pencil size={16} className="text-white" />
                  </button>
                )}
              </div>
              {isOwner && (
                <input
                  type="file"
                  ref={coverImgRef}
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "cover")}
                  accept="image/*"
                />
              )}
              {isOwner && (
                <input
                  type="file"
                  ref={profileImgRef}
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "profile")}
                  accept="image/*"
                />
              )}
            </div>
            {isOwner && (
              <div className="flex justify-end px-4 mt-5 gap-4">
                <EditProfileDialog onSave={handleProfileUpdate} className="" />
                {hasChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProfileUpdate}
                  >
                    Update Profile
                  </Button>
                  // <button
                  //   className='fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg'
                  //   onClick={handleProfileUpdate}
                  // >
                  //   Update Profile
                  // </button>
                )}
              </div>
            )}
            <div className="flex flex-col gap-4 mt-14 px-4">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{profile?.name}</span>
                <span className="text-sm text-slate-500">
                  @{profile?.username}
                </span>
                <span className="text-sm my-1">{profile?.bio}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {profile?.link && typeof profile.link === "string" && (
                  <div className="flex gap-1 items-center">
                    <>
                      <LinkIcon size={16} />
                      <a
                        href={`https://${profile?.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {profile?.link}
                      </a>
                    </>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <CalendarDays size={16} />
                  <span className="text-sm text-slate-500">
                    Joined on{" "}
                    {new Date(profile?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <p>Profile not found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
