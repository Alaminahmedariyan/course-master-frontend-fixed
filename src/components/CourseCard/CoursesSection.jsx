import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCourses } from "../../services/courses.api";
import CoursesFilters from "./CoursesFilters";
import CoursesGrid from "./CoursesGrid";
import CoursesPagination from "./CoursesPagination";

// Delays a fast-changing value so typing does not fire a request per keystroke
function useDebounce(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export default function CoursesSection() {
    const { user } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const limit = 8;
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");

    const debouncedSearch = useDebounce(search);
    const debouncedCategory = useDebounce(category);
    const debouncedTags = useDebounce(tags);

    useEffect(() => {
        let cancelled = false;

        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getCourses({
                    page,
                    limit,
                    search: debouncedSearch.trim() || undefined,
                    sort: sort || undefined,
                    category: debouncedCategory.trim() || undefined,
                    tags: debouncedTags.trim() || undefined,
                });

                if (cancelled) return;
                setCourses(res.data.courses || []);
                setTotalPages(res.data.totalPages || 1);
            } catch {
                if (!cancelled) setError("Failed to load courses");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCourses();

        // Ignore results of outdated requests
        return () => {
            cancelled = true;
        };
    }, [page, sort, debouncedSearch, debouncedCategory, debouncedTags]);

    // Go back to page 1 whenever a filter changes
    const withPageReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            <CoursesFilters
                search={search} setSearch={withPageReset(setSearch)}
                sort={sort} setSort={withPageReset(setSort)}
                category={category} setCategory={withPageReset(setCategory)}
                tags={tags} setTags={withPageReset(setTags)}
                onSearchSubmit={onSearchSubmit}
            />

            {loading && (
                <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && courses.length === 0 && (
                <div className="rounded-xl border border-primary/20 bg-base-200 p-6 text-center">
                    <h3 className="text-lg font-semibold text-primary">No courses found</h3>
                    <p className="mt-1 text-base-content/70">Try adjusting your search or filters.</p>
                </div>
            )}

            {!loading && !error && courses.length > 0 && (
                <>
                    <CoursesGrid courses={courses} />
                    {user?.role === "admin" && (
                        <div className="flex justify-center pt-4">
                            <Link to="/admin/courses" className="btn btn-primary btn-wide">
                                Manage Courses
                            </Link>
                        </div>
                    )}
                </>
            )}

            <CoursesPagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
    );
}