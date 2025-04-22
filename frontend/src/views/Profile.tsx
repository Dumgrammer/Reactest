import { useState, useEffect } from "react";
import Layout from "../Layout/Layouts";
import { getUserProfile, updateUserProfile, ProfileUpdateData, UserProfile } from "../Actions/User";
import Success from "../components/modals/Success";
import Failed from "../components/modals/Failed";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    // Success Modal
    const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
    // Failed Modal
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);

    const [formData, setFormData] = useState<ProfileUpdateData>({
        firstname: "",
        middlename: "",
        lastname: "",
        email: "",
        address: {
            street: "",
            city: "",
            postalCode: "",
            country: "Philippines"
        },
        password: "",
        oldPassword: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError("");
        
        const response = await getUserProfile();
        
        if (response.success && response.data) {
            setProfile(response.data);
            setFormData({
                firstname: response.data.firstname || "",
                middlename: response.data.middlename || "",
                lastname: response.data.lastname || "",
                email: response.data.email || "",
                address: {
                    street: response.data.address?.street || "",
                    city: response.data.address?.city || "",
                    postalCode: response.data.address?.postalCode || "",
                    country: response.data.address?.country || "Philippines"
                }
            });
        } else {
            setError(response.message || "Failed to load profile");
            setIsFailedOpen(true);
        }
        
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address!,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        
        // Create update data object (only include fields that have values)
        const updateData: ProfileUpdateData = {};
        
        if (formData.firstname) updateData.firstname = formData.firstname;
        if (formData.middlename) updateData.middlename = formData.middlename;
        if (formData.lastname) updateData.lastname = formData.lastname;
        if (formData.email) updateData.email = formData.email;
        
        // Only include address if at least one field is filled
        if (formData.address?.street || formData.address?.city || formData.address?.postalCode) {
            updateData.address = formData.address;
        }
        
        // Only include password fields if new password is provided
        if (formData.password) {
            if (!formData.oldPassword) {
                setError("Old password is required to change password");
                setIsFailedOpen(true);
                setSaving(false);
                return;
            }
            updateData.password = formData.password;
            updateData.oldPassword = formData.oldPassword;
        }
        
        const response = await updateUserProfile(updateData);
        
        if (response.success) {
            setSuccessMessage("Profile updated successfully!");
            setIsSuccessOpen(true);
            
            // Update local state with new data
            if (response.data) {
                setProfile(response.data);
            }
            
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                password: "",
                oldPassword: ""
            }));
        } else {
            setError(response.message || "Failed to update profile");
            setIsFailedOpen(true);
        }
        
        setSaving(false);
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    name="middlename"
                                    value={formData.middlename}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Address Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address?.street}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address?.city}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="address.postalCode"
                                        value={formData.address?.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address?.country}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h2 className="text-lg font-medium mb-3">Change Password (Optional)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={formData.oldPassword}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Success Modal */}
            <Success
                isOpen={isSuccessOpen}
                gif={<img className="mx-auto w-1/3" src="/success.gif" alt="Success" />}
                title="Profile Updated" 
                message={successMessage}
                buttonText="OK"
                onConfirm={() => setIsSuccessOpen(false)}
            />
            
            {/* Failed Modal*/}
            <Failed
                isOpen={isFailedOpen} 
                title="Error" 
                message={error || "Something went wrong"}
                buttonText="OK"
                onConfirm={() => setIsFailedOpen(false)}
            />
        </Layout>
    );
} 