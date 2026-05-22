import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processWebinarEnd } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processWebinarEnd, // We'll register our smart alert function here
    ],
});
