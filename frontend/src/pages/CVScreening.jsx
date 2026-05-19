import React, { useState } from "react";
import axios from "axios";

const CVScreening = () => {

    const [cvFile, setCvFile] = useState(null);

    const [parsedCV, setParsedCV] = useState(null);

    const [jobDescription, setJobDescription] = useState("");

    const [requiredSkills, setRequiredSkills] = useState("");

    const [preferredSkills, setPreferredSkills] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const backendURL = "http://localhost:5000/api/screening";

    // ==========================================
    // Upload + Parse CV
    // ==========================================

    const handleUploadCV = async () => {

        if (!cvFile) {
            alert("Please upload a CV file");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("file", cvFile);

            const response = await axios.post(
                `${backendURL}/parse-cv`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setParsedCV(
                response.data.data
            );

            alert("CV parsed successfully");

        } catch (error) {

            console.error(error);

            alert("Failed to parse CV");

        } finally {

            setLoading(false);
        }
    };

    // ==========================================
    // Match CV vs JD
    // ==========================================

    const handleMatch = async () => {

        if (!parsedCV) {
            alert("Please parse CV first");
            return;
        }

        try {

            setLoading(true);

            const jdData = {

                job_title: "Custom Job",

                description: jobDescription,

                requirements: jobDescription,

                required_skills:
                    requiredSkills
                        .split(",")
                        .map(skill => skill.trim()),

                preferred_skills:
                    preferredSkills
                        .split(",")
                        .map(skill => skill.trim())
            };

            const response = await axios.post(
                `${backendURL}/match`,
                {
                    cv_data: parsedCV,
                    jd_data: jdData
                }
            );

            setResult(
                response.data.data
            );

        } catch (error) {

            console.error(error);

            alert("Matching failed");

        } finally {

            setLoading(false);
        }
    };

    return (

        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "40px"
            }}
        >

            <h1>
                AI-Based CV Screening
            </h1>

            {/* ========================= */}
            {/* Upload CV */}
            {/* ========================= */}

            <div
                style={{
                    marginTop: "30px"
                }}
            >

                <h2>
                    Upload CV
                </h2>

                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                        setCvFile(
                            e.target.files[0]
                        )
                    }
                />

                <br />

                <button
                    onClick={handleUploadCV}
                    disabled={loading}
                    style={{
                        marginTop: "15px"
                    }}
                >
                    Parse CV
                </button>

            </div>

            {/* ========================= */}
            {/* Parsed CV */}
            {/* ========================= */}

            {
                parsedCV && (

                    <div
                        style={{
                            marginTop: "40px",
                            padding: "20px",
                            border: "1px solid #ccc"
                        }}
                    >

                        <h2>
                            Parsed Candidate Profile
                        </h2>

                        <p>
                            <strong>Name:</strong>
                            {" "}
                            {parsedCV.name}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            {" "}
                            {parsedCV.email}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            {" "}
                            {parsedCV.phone}
                        </p>

                        <p>
                            <strong>Skills:</strong>
                            {" "}
                            {
                                parsedCV.skills?.join(", ")
                            }
                        </p>

                    </div>
                )
            }

            {/* ========================= */}
            {/* Job Description */}
            {/* ========================= */}

            <div
                style={{
                    marginTop: "40px"
                }}
            >

                <h2>
                    Job Description
                </h2>

                <textarea
                    rows={8}
                    style={{
                        width: "100%"
                    }}
                    placeholder="Paste job description here..."
                    value={jobDescription}
                    onChange={(e) =>
                        setJobDescription(
                            e.target.value
                        )
                    }
                />

                <br />
                <br />

                <input
                    type="text"
                    placeholder="Required Skills (comma separated)"
                    value={requiredSkills}
                    onChange={(e) =>
                        setRequiredSkills(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding: "10px"
                    }}
                />

                <br />
                <br />

                <input
                    type="text"
                    placeholder="Preferred Skills (comma separated)"
                    value={preferredSkills}
                    onChange={(e) =>
                        setPreferredSkills(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding: "10px"
                    }}
                />

                <br />
                <br />

                <button
                    onClick={handleMatch}
                    disabled={loading}
                >
                    Run AI Screening
                </button>

            </div>

            {/* ========================= */}
            {/* Result */}
            {/* ========================= */}

            {
                result && (

                    <div
                        style={{
                            marginTop: "50px",
                            padding: "25px",
                            border: "2px solid black"
                        }}
                    >

                        <h2>
                            Screening Result
                        </h2>

                        <p>
                            <strong>
                                Overall Score:
                            </strong>
                            {" "}
                            {result.overall_score}
                        </p>

                        <p>
                            <strong>
                                Semantic Score:
                            </strong>
                            {" "}
                            {result.semantic_score}
                        </p>

                        <p>
                            <strong>
                                Skill Score:
                            </strong>
                            {" "}
                            {result.skill_score}
                        </p>

                        <p>
                            <strong>
                                Recommendation:
                            </strong>
                            {" "}
                            {result.recommendation}
                        </p>

                        <hr />

                        <h3>
                            Skill Analysis
                        </h3>

                        <p>
                            <strong>
                                Matched Skills:
                            </strong>
                            {" "}
                            {
                                result.skill_analysis
                                    ?.matched_skills
                                    ?.join(", ")
                            }
                        </p>

                        <p>
                            <strong>
                                Missing Skills:
                            </strong>
                            {" "}
                            {
                                result.skill_analysis
                                    ?.missing_skills
                                    ?.join(", ")
                            }
                        </p>

                    </div>
                )
            }

        </div>
    );
};

export default CVScreening;