import { useState } from "react";

const emptyLesson = () => ({ title: "", videoUrl: "", quiz: [] });
const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], correctIndex: 0 });

const toDateInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
};

// datetime-local needs local time, not UTC
const toDateTimeInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// Deep copies so the form never touches frozen Redux state
const buildInitial = (course) => ({
    title: course?.title || "",
    description: course?.description || "",
    instructorName: course?.instructorName || "",
    price: course?.price || 0,
    category: course?.category || "",
    tags: (course?.tags || []).join(", "),
    batches: (course?.batches || []).map((b) => ({ ...b, startDate: toDateInput(b.startDate) })),
    syllabus: JSON.parse(JSON.stringify(course?.syllabus || [])),
});

// Remove empty optional fields so the backend does not receive blank values
const cleanSyllabus = (syllabus) =>
    syllabus.map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((les) => {
            const lesson = { ...les, quiz: (les.quiz || []).filter((q) => q.question?.trim()) };
            if (!lesson.liveClassLink?.trim()) {
                delete lesson.liveClassLink;
                delete lesson.liveClassDate;
            }
            if (!lesson.assignmentPrompt?.trim()) {
                delete lesson.assignmentPrompt;
            }
            return lesson;
        }),
    }));

export default function CourseForm({
    initialValues,
    onSubmit,
    submitting,
    submitLabel,
    submittingLabel,
    error,
    onCancel,
}) {
    const [form, setForm] = useState(() => buildInitial(initialValues));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: name === "price" ? Number(value) : value }));
    };

    // ---- batches ----
    const addBatch = () =>
        setForm((s) => ({ ...s, batches: [...s.batches, { name: "", startDate: "" }] }));

    const removeBatch = (idx) =>
        setForm((s) => ({ ...s, batches: s.batches.filter((_, i) => i !== idx) }));

    const updateBatch = (idx, field, value) =>
        setForm((s) => ({
            ...s,
            batches: s.batches.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
        }));

    // ---- syllabus (all updates are immutable) ----
    const addModule = () =>
        setForm((s) => ({ ...s, syllabus: [...s.syllabus, { title: "", lessons: [] }] }));

    const removeModule = (mi) =>
        setForm((s) => ({ ...s, syllabus: s.syllabus.filter((_, i) => i !== mi) }));

    const updateModule = (mi, patch) =>
        setForm((s) => ({
            ...s,
            syllabus: s.syllabus.map((m, i) => (i === mi ? { ...m, ...patch } : m)),
        }));

    // fn receives the current lesson and returns the new lesson
    const changeLesson = (mi, li, fn) =>
        setForm((s) => ({
            ...s,
            syllabus: s.syllabus.map((m, i) =>
                i !== mi
                    ? m
                    : { ...m, lessons: (m.lessons || []).map((l, j) => (j === li ? fn(l) : l)) }
            ),
        }));

    const addLesson = (mi) =>
        setForm((s) => ({
            ...s,
            syllabus: s.syllabus.map((m, i) =>
                i === mi ? { ...m, lessons: [...(m.lessons || []), emptyLesson()] } : m
            ),
        }));

    const removeLesson = (mi, li) =>
        setForm((s) => ({
            ...s,
            syllabus: s.syllabus.map((m, i) =>
                i === mi ? { ...m, lessons: (m.lessons || []).filter((_, j) => j !== li) } : m
            ),
        }));

    const patchLesson = (mi, li, patch) => changeLesson(mi, li, (l) => ({ ...l, ...patch }));

    const toggleLiveClass = (mi, li) =>
        changeLesson(mi, li, (l) => {
            if (l.liveClassLink !== undefined) {
                const { liveClassLink, liveClassDate, ...rest } = l;
                return rest;
            }
            return { ...l, liveClassLink: "", liveClassDate: "" };
        });

    const toggleAssignment = (mi, li) =>
        changeLesson(mi, li, (l) => {
            if (l.assignmentPrompt !== undefined) {
                const { assignmentPrompt, ...rest } = l;
                return rest;
            }
            return { ...l, assignmentPrompt: "" };
        });

    // ---- quiz ----
    const addQuestion = (mi, li) =>
        changeLesson(mi, li, (l) => ({ ...l, quiz: [...(l.quiz || []), emptyQuestion()] }));

    const removeQuestion = (mi, li, qi) =>
        changeLesson(mi, li, (l) => ({ ...l, quiz: (l.quiz || []).filter((_, k) => k !== qi) }));

    const patchQuestion = (mi, li, qi, patch) =>
        changeLesson(mi, li, (l) => ({
            ...l,
            quiz: (l.quiz || []).map((q, k) => (k === qi ? { ...q, ...patch } : q)),
        }));

    const patchOption = (mi, li, qi, oi, value) =>
        changeLesson(mi, li, (l) => ({
            ...l,
            quiz: (l.quiz || []).map((q, k) =>
                k === qi ? { ...q, options: q.options.map((o, n) => (n === oi ? value : o)) } : q
            ),
        }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitting) return;

        onSubmit({
            title: form.title.trim(),
            description: form.description.trim(),
            instructorName: form.instructorName.trim(),
            price: form.price,
            category: form.category.trim(),
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            batches: form.batches.map((b) => ({
                ...b,
                startDate: b.startDate ? new Date(b.startDate) : undefined,
            })),
            syllabus: cleanSyllabus(form.syllabus),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-semibold">Course Title *</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                    className="input input-bordered"
                    required
                />
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-semibold">Description *</span>
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Course description"
                    className="textarea textarea-bordered h-28"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Instructor Name *</span>
                    </label>
                    <input
                        type="text"
                        name="instructorName"
                        value={form.instructorName}
                        onChange={handleChange}
                        placeholder="Instructor name"
                        className="input input-bordered"
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Price (৳) *</span>
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Price in taka"
                        className="input input-bordered"
                        min="0"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Category</span>
                    </label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g., Web Development"
                        className="input input-bordered"
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold">Tags (comma separated)</span>
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="react, javascript, web"
                        className="input input-bordered"
                    />
                </div>
            </div>

            {/* Syllabus */}
            <div className="divider">Course Syllabus (Modules & Lessons)</div>
            <div className="space-y-4">
                {form.syllabus.map((module, mi) => (
                    <div key={mi} className="card bg-base-100 border border-base-300">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Module {mi + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeModule(mi)}
                                    className="btn btn-sm btn-error"
                                >
                                    Remove Module
                                </button>
                            </div>

                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Module Title *</span>
                                </label>
                                <input
                                    type="text"
                                    value={module.title || ""}
                                    onChange={(e) => updateModule(mi, { title: e.target.value })}
                                    placeholder="e.g., Introduction to React"
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Lessons</h4>
                                    <button
                                        type="button"
                                        onClick={() => addLesson(mi)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        + Add Lesson
                                    </button>
                                </div>

                                {module.lessons?.map((lesson, li) => {
                                    const hasLive = lesson.liveClassLink !== undefined;
                                    const hasAssignment = lesson.assignmentPrompt !== undefined;

                                    return (
                                        <div key={li} className="card bg-base-200 border border-base-300">
                                            <div className="card-body">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-semibold">Lesson {li + 1}</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLesson(mi, li)}
                                                        className="btn btn-xs btn-error"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Lesson Title *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={lesson.title || ""}
                                                            onChange={(e) => patchLesson(mi, li, { title: e.target.value })}
                                                            placeholder="e.g., Setting up React"
                                                            className="input input-bordered input-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">Video URL (YouTube) *</span>
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={lesson.videoUrl || ""}
                                                            onChange={(e) => patchLesson(mi, li, { videoUrl: e.target.value })}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className="input input-bordered input-sm"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Live class */}
                                                    <div className="form-control">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="label-text font-semibold">Live Class (Optional)</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleLiveClass(mi, li)}
                                                                className={`btn btn-sm ${hasLive ? "btn-ghost btn-error" : "btn-outline btn-info"}`}
                                                            >
                                                                {hasLive ? "Remove Live Class" : "+ Add Live Class"}
                                                            </button>
                                                        </div>
                                                        {hasLive && (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="url"
                                                                    value={lesson.liveClassLink || ""}
                                                                    onChange={(e) => patchLesson(mi, li, { liveClassLink: e.target.value })}
                                                                    placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/xxxxx"
                                                                    className="input input-bordered input-sm w-full"
                                                                />
                                                                <input
                                                                    type="datetime-local"
                                                                    value={toDateTimeInput(lesson.liveClassDate)}
                                                                    onChange={(e) =>
                                                                        patchLesson(mi, li, {
                                                                            liveClassDate: e.target.value
                                                                                ? new Date(e.target.value).toISOString()
                                                                                : "",
                                                                        })
                                                                    }
                                                                    className="input input-bordered input-sm w-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Assignment */}
                                                    <div className="form-control">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="label-text font-semibold">Assignment</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleAssignment(mi, li)}
                                                                className={`btn btn-sm ${hasAssignment ? "btn-ghost btn-error" : "btn-outline btn-secondary"}`}
                                                            >
                                                                {hasAssignment ? "Remove Assignment" : "+ Add Assignment"}
                                                            </button>
                                                        </div>
                                                        {hasAssignment && (
                                                            <textarea
                                                                value={lesson.assignmentPrompt || ""}
                                                                onChange={(e) => patchLesson(mi, li, { assignmentPrompt: e.target.value })}
                                                                placeholder="Enter assignment instructions..."
                                                                className="textarea textarea-bordered textarea-sm w-full"
                                                                rows="3"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Quiz */}
                                                    <div className="form-control">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="label-text">Quiz Questions (Optional)</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => addQuestion(mi, li)}
                                                                className="btn btn-xs btn-outline"
                                                            >
                                                                + Add Question
                                                            </button>
                                                        </div>

                                                        {lesson.quiz?.map((quizItem, qi) => (
                                                            <div key={qi} className="card bg-base-300 border border-base-300 mb-2">
                                                                <div className="card-body p-3">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-sm font-semibold">Question {qi + 1}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeQuestion(mi, li, qi)}
                                                                            className="btn btn-xs btn-error"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>

                                                                    <input
                                                                        type="text"
                                                                        value={quizItem.question || ""}
                                                                        onChange={(e) => patchQuestion(mi, li, qi, { question: e.target.value })}
                                                                        placeholder="Enter question"
                                                                        className="input input-bordered input-sm mb-2"
                                                                    />

                                                                    <div className="space-y-1">
                                                                        {quizItem.options?.map((option, oi) => (
                                                                            <div key={oi} className="flex gap-2 items-center">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`quiz-${mi}-${li}-${qi}`}
                                                                                    checked={quizItem.correctIndex === oi}
                                                                                    onChange={() => patchQuestion(mi, li, qi, { correctIndex: oi })}
                                                                                    className="radio radio-xs"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={option || ""}
                                                                                    onChange={(e) => patchOption(mi, li, qi, oi, e.target.value)}
                                                                                    placeholder={`Option ${oi + 1}`}
                                                                                    className="input input-bordered input-sm flex-1"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addModule} className="btn btn-outline btn-sm w-full">
                    + Add Module
                </button>
            </div>

            {/* Batches */}
            <div className="divider">Batches (Optional)</div>
            <div className="space-y-3">
                {form.batches.map((batch, idx) => (
                    <div key={idx} className="card bg-base-100 border border-base-300">
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Batch Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={batch.name || ""}
                                        onChange={(e) => updateBatch(idx, "name", e.target.value)}
                                        placeholder="e.g., Batch 1, Jan 2025"
                                        className="input input-bordered input-sm"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Start Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={batch.startDate || ""}
                                        onChange={(e) => updateBatch(idx, "startDate", e.target.value)}
                                        className="input input-bordered input-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeBatch(idx)}
                                className="btn btn-sm btn-error mt-2"
                            >
                                Remove Batch
                            </button>
                        </div>
                    </div>
                ))}

                <button type="button" onClick={addBatch} className="btn btn-outline btn-sm">
                    + Add Batch
                </button>
            </div>

            <div className="flex gap-3 pt-6">
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            {submittingLabel}
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
                <button type="button" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </button>
            </div>
        </form>
    );
}