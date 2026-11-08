const emailSettings = {
    publicKey: "2dTbiOw0m_mCmoHSS",
    serviceId: "service_5od3glp",
    templateId: "template_9t5sme2"
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const namePattern = /^[A-Za-z][A-Za-z\s'.-]+$/;
const phonePattern = /^\+?[0-9\s()-]+$/;

function isEmailReady() {
    return typeof emailjs !== "undefined" && !emailSettings.publicKey.startsWith("YOUR_");
}

if (isEmailReady()) {
    emailjs.init({ publicKey: emailSettings.publicKey });
}

function todayAsText() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return today.getFullYear() + "-" + month + "-" + day;
}

function findProblem(field) {
    const value = field.value.trim();
    const label = field.dataset.label;

    if (field.required && value === "") {
        return "Please enter your " + label + ".";
    }

    if (field.dataset.type === "name" && (value.length < 2 || !namePattern.test(value))) {
        return "Please enter a valid name using letters only.";
    }

    if (field.dataset.type === "email" && !emailPattern.test(value)) {
        return "Please enter a valid email address, for example name@example.com.";
    }

    if (field.dataset.type === "phone") {
        const digits = value.replace(/\D/g, "");
        if (!phonePattern.test(value) || digits.length < 8 || digits.length > 12) {
            return "Please enter a valid phone number, for example 0412 345 678.";
        }
    }

    if (field.dataset.type === "date" && value < todayAsText()) {
        return "Please choose today or a future date.";
    }

    if (field.dataset.type === "message" && value.length < 10) {
        return "Please write at least 10 characters so we can help you.";
    }

    return "";
}

function checkField(field) {
    const errorBox = document.querySelector("#" + field.id + "-error");
    const problem = findProblem(field);

    if (problem) {
        field.setAttribute("aria-invalid", "true");
        errorBox.textContent = problem;
        return false;
    }

    field.removeAttribute("aria-invalid");
    errorBox.textContent = "";
    return true;
}

function showStatus(statusBox, message, type) {
    statusBox.textContent = message;
    statusBox.className = "form-status is-" + type;
}

function setUpForm(form) {
    const fields = form.querySelectorAll("[data-type]");
    const statusBox = form.querySelector(".form-status");
    const submitButton = form.querySelector("button[type='submit']");
    const buttonText = submitButton.textContent;

    fields.forEach(function (field) {
        field.addEventListener("input", function () {
            if (field.getAttribute("aria-invalid") === "true") {
                checkField(field);
            }
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let firstProblemField = null;

        fields.forEach(function (field) {
            if (!checkField(field) && !firstProblemField) {
                firstProblemField = field;
            }
        });

        if (firstProblemField) {
            showStatus(statusBox, "Please fix the highlighted fields and try again.", "error");
            firstProblemField.focus();
            return;
        }

        if (!isEmailReady()) {
            showStatus(statusBox, "Your details are valid, but the email service is not connected yet. Please call us on (02) 5550 4400.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        emailjs.sendForm(emailSettings.serviceId, emailSettings.templateId, form)
            .then(function () {
                showStatus(statusBox, form.dataset.success, "success");
                form.reset();
            })
            .catch(function () {
                showStatus(statusBox, "Sorry, your message could not be sent. Please try again or email hello@wanderlux.com.au.", "error");
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = buttonText;
            });
    });
}

const dateInput = document.querySelector("#preferred-date");

if (dateInput) {
    dateInput.min = todayAsText();
}

document.querySelectorAll(".email-form").forEach(setUpForm);
