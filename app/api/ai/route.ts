import { NextRequest } from "next/server"
import { GoogleGenAI, ThinkingLevel } from "@google/genai"

export async function POST(req: NextRequest) {
    try {
        const { userInput, type, systemPrompt } = await req.json()

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        })

        // Keep the model contract strict because the client converts this JSON directly into Excalidraw elements.
        const finalPrompt = `
${systemPrompt}

USER REQUEST:
${userInput}

CANVAS GENERATION RULES:

Create a simple, clean, professional and colorful ${type}.

The diagram must be easy to understand at a glance.

SIMPLICITY RULES:
- Keep the design minimal
- Do not overcomplicate the diagram
- Use only essential elements
- Avoid unnecessary sections, shapes or decorative elements
- Prefer simple layouts such as top-to-bottom or left-to-right
- Keep consistent alignment and spacing
- Keep enough whitespace between elements
- Avoid overlapping elements
- Keep the entire diagram compact but never cramped

LAYOUT RULES:
- Spread nodes enough that labels, shapes, and arrows are easy to see
- Leave at least 90 to 140 pixels of visual space between neighboring shapes
- Align related steps in clear rows or columns
- Put connected shapes close enough to follow, but not touching
- Avoid placing arrows through unrelated shapes
- Prefer readable spacing over using the smallest possible canvas area

TEXT RULES:
- Use minimal text
- Keep labels very short
- Prefer 1 to 4 words per label
- Avoid sentences unless absolutely necessary
- Do not add long descriptions
- Do not repeat information
- Use smaller text sizes
- Prefer fontSize between 14 and 18
- Use 20 only for important headings
- Keep text easy to scan

ELEMENT RULES:
- Every element must have a unique id
- Every element must have type, x and y
- Add width and height when applicable
- Use label for text inside shapes
- Use text only for standalone text elements
- Every visual element must have roughness: 0
- Use strokeWidth between 1 and 2
- Prefer simple solid fills
- Avoid unnecessary Excalidraw internal properties

STYLE RULES:
- Use a clean flat design
- roughness must always be 0
- Prefer rounded rectangles where appropriate
- Use consistent shape sizes
- Keep borders subtle
- Avoid overly large elements
- Avoid complex visual decorations
- Avoid sketch-style rendering

COLOR RULES:
- Make the diagram colorful but subtle
- Every shape should include backgroundColor and strokeColor
- Use valid HEX colors
- Prefer soft pastel backgrounds
- Use darker matching borders
- Use colors meaningfully
- Do not use too many colors
- Prefer approximately 3 to 5 colors in one diagram
- Keep strong text contrast

RECOMMENDED COLORS:
Blue:
backgroundColor "#DBEAFE"
strokeColor "#2563EB"

Purple:
backgroundColor "#EDE9FE"
strokeColor "#7C3AED"

Green:
backgroundColor "#DCFCE7"
strokeColor "#16A34A"

Orange:
backgroundColor "#FFEDD5"
strokeColor "#EA580C"

Pink:
backgroundColor "#FCE7F3"
strokeColor "#DB2777"

Cyan:
backgroundColor "#CFFAFE"
strokeColor "#0891B2"

CONNECTION RULES:
- Connections must reference valid element IDs
- Every connection must connect from the edge of one shape to the edge of another shape
- Do not start or end a connection in the middle of a shape
- Only create connections when they improve understanding
- Avoid unnecessary arrows
- Avoid duplicate connections
- Use short connection labels only when necessary
- Prefer no connection label instead of unnecessary text
- Connections should clearly indicate direction
- Use simple straight or elbow-style logical connections
- Route connections so they do not overlap labels or pass through unrelated nodes

COMPLEXITY RULES:
- Prefer fewer meaningful elements
- Do not create multiple elements when one element can explain the concept
- For simple requests prefer approximately 4 to 8 elements
- For medium diagrams prefer approximately 6 to 12 elements
- Only exceed this when the user request genuinely requires it
- Optimize for readability instead of detail

OUTPUT SIZE RULES:
- Keep output well below 65536 tokens
- Do not repeat properties unnecessarily
- Do not generate unnecessary content

Return ONLY valid JSON.
Do not include markdown.
Do not include code fences.
Do not include explanations.

Return JSON using this structure:

{
    "title": "",
    "elements": [
        {
            "id": "",
            "type": "",
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "label": "",
            "fontSize": 16,
            "backgroundColor": "#DBEAFE",
            "strokeColor": "#2563EB",
            "strokeWidth": 1,
            "roughness": 0
        }
    ],
    "connections": [
        {
            "id": "",
            "from": "",
            "to": "",
            "label": "",
            "strokeColor": "#64748B",
            "strokeWidth": 1,
            "roughness": 0
        }
    ]
}
`

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: finalPrompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.MEDIUM,
                },
                maxOutputTokens: 65536,
                responseMimeType: "application/json",
            },
        })

        const text = response.text

        if (!text) {
            return Response.json(
                {
                    success: false,
                    error: "AI returned empty response",
                },
                {
                    status: 500,
                }
            )
        }

        const diagramResult = JSON.parse(text)

        return Response.json({
            success: true,
            diagramResult,
        })
    } catch (error) {
        console.error("AI Diagram Generation Error:", error)

        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to generate diagram",
            },
            {
                status: 500,
            }
        )
    }
}
