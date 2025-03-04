import { useState } from "react";
import Layout from "../../Layout/Layouts";
import { userRegistration } from "../../Actions/User";

export default function Register() {
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmationpass, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            await userRegistration(firstname, middlename, lastname, email, password, confirmationpass);
            alert("Registration successful!");
        } catch (err) {
            setError("Failed to register user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            {loading ? (
                <h1>Loading...</h1>
            ) : error ? (
                <h1>{error}</h1>
            ) : (
                <div className="mid-flex">
                    <form className="max-w-md mx-auto flex flex-col items-center" onSubmit={submitForm}>
                        <div className="h1">Registration</div>
                        <div className="grid md:grid-cols-3 md:gap-4 w-full">
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    id="floating_first_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    required
                                    value={firstname}
                                    onChange={(event) => setFirstname(event.target.value)}
                                />
                                <label htmlFor="floating_first_name">First name</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    id="floating_middle_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    required
                                    value={middlename}
                                    onChange={(event) => setMiddlename(event.target.value)}
                                />
                                <label htmlFor="floating_middle_name">Middle name</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    id="floating_last_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    required
                                    value={lastname}
                                    onChange={(event) => setLastname(event.target.value)}
                                />
                                <label htmlFor="floating_last_name">Last name</label>
                            </div>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="email"
                                id="floating_email"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                            <label htmlFor="floating_email">Email address</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="password"
                                id="floating_password"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <label htmlFor="floating_password">Password</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="password"
                                id="floating_repeat_password"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={confirmationpass}
                                onChange={(event) => setConfirm(event.target.value)}
                            />
                            <label htmlFor="floating_repeat_password">Confirm password</label>
                        </div>

                        <button type="submit" className="p-btn">Submit</button>
                    </form>
                </div>
            )}
        </Layout>
    );
}
