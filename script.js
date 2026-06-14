const promptBox = document.getElementById("prompt");
const responseBox = document.getElementById("response");

const askBtn = document.getElementById("askBtn");
const summaryBtn = document.getElementById("summaryBtn");
const quizBtn = document.getElementById("quizBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

askBtn.onclick = () => runAI("answer");
summaryBtn.onclick = () => runAI("summary");
quizBtn.onclick = () => runAI("quiz");

promptBox.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        runAI("answer");
    }
});

copyBtn.onclick = () => {
    navigator.clipboard.writeText(responseBox.innerText);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => copyBtn.textContent = "📋 Copy", 1500);
};

downloadBtn.onclick = () => {

    const blob = new Blob(
        [responseBox.innerText],
        { type: "text/plain" }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "EduMentor_Response.txt";

    link.click();

};

clearBtn.onclick = () => {

    promptBox.value = "";

    responseBox.innerHTML = "AI response will appear here...";

};

async function runAI(mode) {

    const input = promptBox.value.trim();

    if (!input) {

        responseBox.innerHTML = "⚠️ Please enter something.";

        return;

    }

    let instruction = "";

    switch (mode) {

        case "summary":

            instruction =
`Summarize the following notes.

Use headings and bullet points.

Notes:

${input}`;

            break;

        case "quiz":

            instruction =
`Generate 5 multiple choice questions from this topic.

Each question should have:

A)

B)

C)

D)

Mention the correct answer after each question.

Topic:

${input}`;

            break;

        default:

            instruction =
`You are EduMentor AI.

You are an expert educational assistant.

Rules:

- Explain in simple language.
- Use headings.
- Use bullet points.
- Give examples.
- If programming, provide code.
- If mathematics, solve step by step.
- Keep answers educational.

Student Question:

${input}`;

    }

    askBtn.disabled = true;
    summaryBtn.disabled = true;
    quizBtn.disabled = true;

    responseBox.innerHTML = "⏳ Thinking...";

    try {

        const res = await fetch(

            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    contents: [

                        {

                            parts: [

                                {

                                    text: instruction

                                }

                            ]

                        }

                    ]

                })

            }

        );

        if (!res.ok) {

            throw new Error("Request Failed");

        }

        const data = await res.json();

        const answer =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response received.";

        responseBox.innerHTML = marked.parse(answer);

        responseBox.scrollIntoView({

            behavior: "smooth"

        });

    }

    catch (err) {

        console.error(err);

        responseBox.innerHTML =
            "❌ Unable to connect to Gemini AI.";

    }

    askBtn.disabled = false;
    summaryBtn.disabled = false;
    quizBtn.disabled = false;

}
