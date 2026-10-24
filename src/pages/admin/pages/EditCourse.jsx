import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCourseById } from "../../../store/slices/coursesSlice";
import { updateCourseAsync, clearError, clearSuccess } from "../../../store/slices/adminSlice";
import CourseForm from "../components/CourseForm";

export default function EditCourse() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentCourse, detailLoading, error: courseError } = useSelector((state) => state.courses);
    const { updating, error } = useSelector((state) => state.admin);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
    }, [dispatch]);

    useEffect(() => {
        if (!currentCourse || currentCourse._id !== id) {
            dispatch(fetchCourseById(id));
        }
    }, [dispatch, id, currentCourse]);

    const handleSubmit = async (payload) => {
        const res = await dispatch(updateCourseAsync({ id, data: payload }));
        if (!res.error) {
            navigate("/admin/courses");
        }
    };

    if (detailLoading || !currentCourse || currentCourse._id !== id) {
        if (courseError && !detailLoading) {
            return (
                <div className="alert alert-error">
                    <span>{courseError}</span>
                </div>
            );
        }
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl w-full">
            <h1 className="page-heading mb-4 sm:mb-6">Edit Course</h1>

            <CourseForm
                key={currentCourse._id}
                initialValues={currentCourse}
                onSubmit={handleSubmit}
                submitting={updating}
                submitLabel="Update Course"
                submittingLabel="Updating..."
                error={error}
                onCancel={() => navigate("/admin/courses")}
            />
        </div>
    );
}