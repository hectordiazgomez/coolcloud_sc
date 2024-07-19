import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaCloud, FaBolt, FaDatabase, FaCheckCircle, FaPencilAlt, FaChevronRight, FaGithub, FaRocket, FaCode, FaLightbulb, FaPython, FaNodeJs, FaGem, FaReact, FaVuejs } from "react-icons/fa";

const Home = ({ signInWithGitHub, loggedIn }) => {
    const navigate = useNavigate();
    const features = [
        {
            icon: FaBolt,
            title: "Deploy faster",
            description: "CoolCloud Core is a frontend cloud solution for developers to build and deploy future-proof digital solutions with modern, composable tooling that works with all modern frameworks.",
            features: ["Instant deployment", "Auto-scaling", "Global CDN"],
            image: "https://hator.blob.core.windows.net/coolcloud/deploy.png"
        },
        {
            icon: FaDatabase,
            title: "Unify all content",
            description: "CoolCloud Connect is a data unification layer that gives web teams the freedom to create world-class websites, online stores, and applications with data from any existing or new content source.",
            features: ["Headless CMS integration", "API management", "Real-time sync"],
            image: "https://hator.blob.core.windows.net/coolcloud/hosting.png"
        },
        {
            icon: FaPencilAlt,
            title: "Demos & Tutorials",
            description: 'Explore our comprehensive demos and tutorials to kickstart your development journey:',
            links: [
                { name: "Django", icon: FaPython },
                { name: "Node.js", icon: FaNodeJs },
                { name: "Ruby on Rails", icon: FaGem },
                { name: "React", icon: FaReact },
                { name: "Vue.js", icon: FaVuejs }
            ],
            image: "https://hator.blob.core.windows.net/coolcloud/collaboration.png"
        }
    ];

    const goToDashboard = () => {
        navigate("/dashboard");
    }

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
            <header className="bg-white shadow-sm fixed w-full z-50">
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-indigo-600">CoolCloud</span>
                    </div>
                    <nav className="hidden md:flex space-x-6">
                        {["Platform", "Integrations", "Start Building", "Docs"].map((item) => (
                            <a key={item} href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <a href="#" className="text-gray-600 sm:flex hidden hover:text-indigo-600 transition-colors">Contact</a>
                        {loggedIn && (
                            <Link to="/dashboard" className="text-gray-600 hidden sm:flex hover:text-indigo-600 transition-colors">
                                Dashboard
                            </Link>
                        )}
                        <button
                            onClick={signInWithGitHub}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition-colors flex items-center"
                        >
                            <FaGithub className="mr-2" />
                            {loggedIn ? "Sign out" : "Sign up"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <section className="bg-gradient-to-r from-blue-50 to-indigo-100 text-gray-800 h-screen flex items-center">
                    <div className="container mx-auto text-center px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-800">
                            Connect everything.<br />Build anything.
                        </h1>
                        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-600">
                            CoolCloud is the essential platform for the delivery of exceptional and
                            dynamic web experiences, without limitations.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button onClick={loggedIn ? goToDashboard : signInWithGitHub} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full transition-colors text-lg">
                                {loggedIn ? "Go to dashboard" : "Deploy to CoolCloud"}
                            </button>
                            <button className="bg-transparent hover:bg-indigo-100 text-indigo-600 font-bold py-4 px-8 border-2 border-indigo-600 rounded-full transition-colors text-lg">
                                View demo
                            </button>
                        </div>
                    </div>
                </section>
                <section className="bg-gradient-to-b from-white to-gray-100 xl:px-20 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center">CoolCloud Composable Web Platform</h2>
                        <p className="text-xl mb-16 max-w-3xl mx-auto text-gray-600 text-center">
                            Streamlined orchestration, simplified and unified workflows, and real-time updates across
                            infrastructure, workflows, websites and teams — all supported by Enterprise-grade security,
                            services, and a world-class partner ecosystem.
                        </p>
                        <div className="space-y-40">
                            {features.map((feature, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                                        <feature.icon className="text-6xl text-indigo-500 mb-4" />
                                        <h3 className="text-3xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                                        <p className="text-gray-600 mb-6">{feature.description}</p>
                                        {feature.features && (
                                            <ul className="mb-6 space-y-2">
                                                {feature.features.map((item, i) => (
                                                    <li key={i} className="flex items-center text-gray-700">
                                                        <FaCheckCircle className="text-green-500 mr-2" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {feature.links && (
                                            <div className="flex flex-wrap gap-4 mb-6">
                                                {feature.links.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href="#"
                                                        className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                                    >
                                                        <link.icon className="mr-2" />
                                                        {link.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <a href="#" className="text-indigo-600 hover:text-indigo-700 inline-flex items-center font-semibold group">
                                            Learn more
                                            <FaChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                    <div className={`w-full md:w-1/2 mt-8 md:mt-0 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                                        <div className="bg-white p-4 flex justify-center rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                            <img src={feature.image} alt={feature.title} className="w-1/2 h-auto rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-100 sm:px-20 py-12">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
                    {[
                        { title: "Why CoolCloud?", items: ["Customers", "Composable Web Platform", "Security"] },
                        { title: "Products", items: ["Pricing", "Changelog", "Add-ons"] },
                        { title: "Contact Us", items: ["Sales", "Support", "Status", "Forums"] },
                        { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Cookie Policy"] }
                    ].map((section, index) => (
                        <div key={index}>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">{section.title}</h3>
                            <ul className="text-gray-600 space-y-2">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <a href="#" className="hover:text-indigo-600 transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center text-gray-500">
                    <p>&copy; 2024 CoolCloud. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;