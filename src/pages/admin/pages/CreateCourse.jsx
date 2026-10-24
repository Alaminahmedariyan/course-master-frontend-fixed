import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createCourseAsync, clearSuccess, clearError } from "../../../store/slices/adminSlice";
import CourseForm from "../components/CourseForm";

export default function CreateCourse() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { creating, success, error } = useSelector((state) => state.admin);

    // Clear stale messages left by a previous visit
    useEffect(() => {
        dispatch(clearSuccess());
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = async (payload) => {
        const result = await dispatch(createCourseAsync(payload));
        if (!result.error) {
            setTimeout(() => navigate("/admin/courses"), 1500);
        }
    };

    if (success) {
        return (
            <div className="alert alert-success">
                <span>{success}</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl w-full">
            <h1 className="page-heading mb-4 sm:mb-6">Create New Course</h1>

            <CourseForm
                initialValues={null}
                onSubmit={handleSubmit}
                submitting={creating}
                submitLabel="Create Course"
                submittingLabel="Creating..."
                error={error}
                onCancel={() => navigate("/admin/courses")}
            />
        </div>
    );
}