import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { NewMovie } from "../types/movie";

type BooleanFieldKey = "isNetflixOriginal" | "bookmarkable";

type FormState = {
  title: string;
  year: string;
  genre: string;
  cast: string;
  director: string;
  rating: string;
  durationMin: string;
  isNetflixOriginal: "yes" | "no";
  watchedDate: string;
  link: string;
  bookmarkable: "yes" | "no";
};

type TextFieldKey = Exclude<keyof FormState, BooleanFieldKey>;

type TextFieldSpec = {
  key: TextFieldKey;
  label: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string;
  validate: (value: string) => string | null;
};

type BooleanFieldSpec = {
  key: BooleanFieldKey;
  label: string;
  defaultValue: "yes" | "no";
};

type SubmitErrorState = {
  message: string;
  field: TextFieldKey;
};

function commaSeparatedList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function requireNonEmpty(label: string) {
  return (value: string) => (value.trim() ? null : `Please enter a ${label}.`);
}

function requireFiniteInRange(label: string, min: number, max: number) {
  return (value: string) => {
    if (!value.trim()) return `Please enter a ${label}.`;
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) {
      return `${label} must be between ${min} and ${max}.`;
    }
    return null;
  };
}

const TEXT_FIELDS: readonly TextFieldSpec[] = [
  {
    key: "title",
    label: "Title",
    required: true,
    defaultValue: "",
    validate: requireNonEmpty("title"),
  },
  {
    key: "year",
    label: "Year",
    type: "number",
    min: 1900,
    max: 2100,
    required: true,
    defaultValue: "",
    validate: requireFiniteInRange("Year", 1900, 2100),
  },
  {
    key: "genre",
    label: "Genre (comma separated)",
    required: true,
    defaultValue: "",
    validate: (value) =>
      commaSeparatedList(value).length > 0 ? null : "Add at least one genre.",
  },
  {
    key: "director",
    label: "Director",
    required: true,
    defaultValue: "",
    validate: requireNonEmpty("director"),
  },
  {
    key: "cast",
    label: "Cast (comma separated)",
    defaultValue: "",
    validate: () => null,
  },
  {
    key: "rating",
    label: "Rating (0-10)",
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    required: true,
    defaultValue: "",
    validate: requireFiniteInRange("Rating", 0, 10),
  },
  {
    key: "durationMin",
    label: "Duration (minutes)",
    type: "number",
    min: 1,
    required: true,
    defaultValue: "",
    validate: (value) => {
      if (!value.trim()) return "Please enter a duration in minutes.";
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) {
        return "Duration must be greater than 0 minutes.";
      }
      return null;
    },
  },
  {
    key: "watchedDate",
    label: "Watched Date",
    type: "date",
    required: true,
    defaultValue: "",
    validate: requireNonEmpty("watched date"),
  },
  {
    key: "link",
    label: "IMDb Link",
    type: "url",
    required: true,
    defaultValue: "",
    validate: requireNonEmpty("IMDb link"),
  },
];

const BOOLEAN_FIELDS: readonly BooleanFieldSpec[] = [
  { key: "isNetflixOriginal", label: "Netflix Original", defaultValue: "yes" },
  { key: "bookmarkable", label: "Bookmarkable", defaultValue: "yes" },
];

const DEFAULT_FORM_STATE = Object.fromEntries([
  ...TEXT_FIELDS.map((f) => [f.key, f.defaultValue]),
  ...BOOLEAN_FIELDS.map((f) => [f.key, f.defaultValue]),
]) as FormState;

type ValidationResult =
  | { valid: true }
  | { valid: false; message: string; field: TextFieldKey };

function validateFields(state: FormState): ValidationResult {
  for (const field of TEXT_FIELDS) {
    const error = field.validate(state[field.key]);
    if (error) {
      return { valid: false, message: error, field: field.key };
    }
  }
  return { valid: true };
}

function buildNewMovie(state: FormState): NewMovie {
  return {
    title: state.title.trim(),
    year: Number(state.year),
    genre: commaSeparatedList(state.genre),
    director: state.director.trim(),
    cast: commaSeparatedList(state.cast),
    rating: Number(state.rating),
    durationMin: Number(state.durationMin),
    isNetflixOriginal: state.isNetflixOriginal === "yes",
    watchedDate: state.watchedDate,
    link: state.link.trim(),
    bookmarkable: state.bookmarkable === "yes",
  };
}

function booleanChoiceFromSelect(value: string): "yes" | "no" {
  return value === "no" ? "no" : "yes";
}

type AddMovieFormProps = {
  onAddMovie: (movie: NewMovie) => void;
};

export default function AddMovieForm({ onAddMovie }: AddMovieFormProps) {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [submitError, setSubmitError] = useState<SubmitErrorState | null>(null);
  const fieldRefs = useRef<Partial<Record<TextFieldKey, HTMLInputElement | null>>>({});

  useLayoutEffect(() => {
    if (submitError) {
      fieldRefs.current[submitError.field]?.focus();
    }
  }, [submitError]);

  const handleTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const key = event.target.name as TextFieldKey;
    setSubmitError(null);
    setFormState((prev) => ({ ...prev, [key]: event.target.value }));
  }, []);

  const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const key = event.target.name as BooleanFieldKey;
    setSubmitError(null);
    setFormState((prev) => ({ ...prev, [key]: booleanChoiceFromSelect(event.target.value) }));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const result = validateFields(formState);
    if (result.valid === false) {
      setSubmitError({ message: result.message, field: result.field });
      return;
    }

    onAddMovie(buildNewMovie(formState));
    setFormState(DEFAULT_FORM_STATE);
    setSubmitError(null);
  }

  return (
    <section className="add-movie-form-wrapper" aria-label="Add movie">
      <h2>Add Movie</h2>
      <form className="add-movie-form" onSubmit={handleSubmit}>
        {TEXT_FIELDS.map(({ key, label, type = "text", required, min, max, step }) => (
          <label key={key}>
            {label}
            <input
              id={`add-movie-field-${key}`}
              name={key}
              type={type}
              min={min}
              max={max}
              step={step}
              value={formState[key]}
              onChange={handleTextChange}
              required={required}
              ref={(el) => {
                fieldRefs.current[key] = el;
              }}
              aria-invalid={submitError?.field === key ? true : undefined}
              aria-describedby={submitError?.field === key ? "add-movie-form-error" : undefined}
            />
          </label>
        ))}
        {BOOLEAN_FIELDS.map(({ key, label }) => (
          <label key={key}>
            {label}
            <select name={key} value={formState[key]} onChange={handleSelectChange}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        ))}
        <button type="submit">Add Movie</button>
      </form>
      {submitError ? (
        <p id="add-movie-form-error" className="form-error" role="alert" aria-atomic="true">
          {submitError.message}
        </p>
      ) : null}
    </section>
  );
}
