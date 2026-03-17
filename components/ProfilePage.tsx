'use client';

import { User, Mail, Shield, Save, Upload, X, Eye, EyeOff, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { updateProfile, signOut } from 'firebase/auth';
import { auth } from "@/firebase/client";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{uid: string; email: string; name: string; photoURL?: string} | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/current-user');
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        
        // Split name into first and last name
        const nameParts = user.name?.split(' ') || [''];
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        
        // Set profile image if exists
        if (user.photoURL) {
          setProfileImage(user.photoURL);
        }

        setHeadline(user.headline || '');
        setBio(user.bio || '');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const compressImage = (file: File, maxWidth = 300, maxHeight = 300, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      
      try {
        // Compress the image
        const compressedImage = await compressImage(file);
        setProfileImage(compressedImage);
        
        // Check compressed size (base64 is about 1.37x larger than binary)
        const sizeInBytes = (compressedImage.length * 3) / 4;
        if (sizeInBytes > 500000) { // 500KB limit
          toast.error('Image is too large even after compression. Please try a smaller image.');
          return;
        }
        
        toast.success('Image compressed and ready to upload');
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Error processing image. Please try again.');
      }
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      let photoURL = profileImage;
      
      // If there's a new image file, convert to base64 for storage
      if (imageFile) {
        photoURL = profileImage; // This is already the base64 string from the FileReader
      }

      // Update user profile in the database
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          displayName: fullName,
          photoURL: photoURL,
          headline,
          bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Profile update result:', result);

      // Update Firebase profile (only displayName, not photoURL)
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: fullName
          // Note: photoURL is handled separately in our API via Firestore
        });
      }

      // Force refresh of current user data
      await getCurrentUser();

      // Trigger a refresh in the navigation
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      toast.success('Profile updated successfully!');

      // Instead of reloading the page, just update the local state
      // The getCurrentUser() call and profileUpdated event should handle the updates
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update profile: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentUser) return;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      toast.success('Password changed successfully! You will be signed out for security.');
      
      // Clear form and close modal
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);

      // Sign out the user and redirect to sign-in page after a brief delay
      setTimeout(async () => {
        try {
          // Sign out from Firebase
          await signOut(auth);
          
          // Also call logout API to clear server-side session
          await fetch('/api/logout', { method: 'POST' });
          
          // Redirect to sign-in page
          router.push('/sign-in');
        } catch (logoutError) {
          console.error('Error during logout:', logoutError);
          // Force redirect even if logout fails
          router.push('/sign-in');
        }
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to change password: ${errorMessage}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-cyan-600/10 p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Profile
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
              
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Frontend Engineer | React | Next.js"
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-400 mt-1">Shown as a quick summary on your profile.</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-8 flex-1">
              <h3 className="text-xl font-bold text-white mb-6">Profile Picture</h3>
              
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Image Display */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Remove Image Button */}
                  {profileImage && (
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div className="w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Supported formats: JPG, PNG, GIF<br />
                  Max size: 5MB
                </p>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-gray-800/50 rounded-2xl p-8 flex-1">
              <h3 className="text-xl font-bold text-white mb-6">
                <Shield className="w-5 h-5 inline mr-2" />
                Account Security
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-700/70">
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-sm text-gray-400">Last updated 30 days ago</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Change
                  </button>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Keep your account secure by using a strong password and updating it regularly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Password must be at least 6 characters long. You will be automatically signed out after changing your password.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closePasswordModal}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
