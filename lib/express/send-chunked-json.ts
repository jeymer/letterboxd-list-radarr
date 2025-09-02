import { Response } from "express";


// If no push happened after 30 seconds, close connection.
const PUSH_TIMEOUT = 60 * 1000;

/**
 * Stream array of objects as JSON to client.
 */
export const sendChunkedJson = (res: Response) => {
    let isFirstChunk = true;

    res.header("Content-Type", "application/json");
    res.header("Transfer-Encoding", "chunked");

    // Close connection ourselves if there is no push after a certain timeout
    let pushTimeout: NodeJS.Timeout;
    const resetTimeout = () => {
        clearTimeout(pushTimeout);
        pushTimeout = setTimeout(
            () =>
                chunk.fail(
                    504,
                    "Server closed connection. No more data received."
                ),
            PUSH_TIMEOUT
        );
    };

    resetTimeout();

    const clearTimers = () => {
        clearTimeout(pushTimeout);
    };

    const chunk = {
        push(chunk: any) {
            if (!res.writable) {
                clearTimers();
                return;
            }

            res.write(isFirstChunk ? "[" : ",");
            res.write(JSON.stringify(chunk));
            res.write("\r\n");
            resetTimeout();
            isFirstChunk = false;
        },
        end() {
            clearTimers();

            if (!res.writable) {
                return;
            }

            if (isFirstChunk) {
                res.write("[");
            }
            res.end("]");
        },
        fail(code: number, message: string) {
            if (!res.writable) {
                clearTimers();
                return;
            }

            res.status(code);

            chunk.push({ message });
            chunk.end();
        },
    };

    return chunk;
};
