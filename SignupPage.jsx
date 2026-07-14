import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 characters, with at least one lowercase letter, one uppercase letter,
// one digit, and one special character.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_HINT = "At least 8 characters, with uppercase, lowercase, a number, and a special character.";

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (data) => {
        const newErrors = {};
        const email = data.email.trim();

        if (!email) {
            newErrors.email = "Email is required.";
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = "Please enter a valid email address (e.g. name@example.com).";
        }

        if (!data.password) {
            newErrors.password = "Password is required.";
        } else if (!PASSWORD_REGEX.test(data.password)) {
            newErrors.password = PASSWORD_HINT;
        }

        if (!data.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (data.password && data.confirmPassword !== data.password) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);

        if (errors[name] || (name === "password" && errors.confirmPassword)) {
            const fieldErrors = validate(updated);
            setErrors((prev) => ({
                ...prev,
                [name]: fieldErrors[name],
                ...(name === "password" ? { confirmPassword: fieldErrors.confirmPassword } : {}),
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        const validationErrors = validate(formData);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setSubmitError(data.message || "Could not create account. Please try again.");
                return;
            }

            navigate("/login");
        } catch (err) {
            setSubmitError("Could not reach the server. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-4 py-16 min-h-[70vh]">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                <div className="text-center mb-8">
                    <div className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                        G
                    </div>
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-gray-600 text-sm mt-1">Start turning your photos into Ghibli art.</p>
                </div>

                {submitError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-semibold mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            aria-invalid={!!errors.email}
                            className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:border-transparent transition ${
                                errors.email ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-orange-800"
                            }`}
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-semibold mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                aria-invalid={!!errors.password}
                                className={`w-full p-3 pr-11 border rounded-lg bg-white focus:ring-2 focus:border-transparent transition ${
                                    errors.password ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-orange-800"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password ? (
                            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1">{PASSWORD_HINT}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            aria-invalid={!!errors.confirmPassword}
                            className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:border-transparent transition ${
                                errors.confirmPassword ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-orange-800"
                            }`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-900 text-white font-bold py-3 rounded-lg hover:bg-orange-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-orange-900 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
