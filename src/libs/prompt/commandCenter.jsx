import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * CommandCenter is a utility class designed to manage and execute commands
 * within a system. It provides functionality for registering commands, parsing
 * user input, and simulating typed messages with a typing effect.
 *
 * @class
 */
class CommandCenter {
  constructor(setMessages) {
    this.commands = {};
    this.setMessages = setMessages; // Use React's state updater
    this.typing = false; // State to indicate if currently typing
    this.subscribers = {}; // Map of log IDs to subscriber functions
    this.messageQueue = []; // Queue to manage logMessage calls
    this.isProcessingQueue = false; // Flag to indicate if the queue is being processed
  }

  /**
   * Registers a new command in the command center.
   *
   * @param {string} name - The unique name of the command.
   * @param {string} description - A brief description of what the command does.
   * @param {Function} callback - The function to execute when the command is invoked.
   */
  registerCommand(name, description, callback) {
    this.commands[name] = { description, callback };
  }

  /**
   * Parses a given prompt string, extracts the command and its arguments,
   * and executes the corresponding command callback if it exists.
   * Logs the prompt or an error message if the command is unknown.
   *
   * @param {string} prompt - The input string containing the command and arguments.
   */
  parsePrompt(prompt) {
    const [command, ...args] = prompt.split(" ");
    if (this.commands[command]) {
      this.logMessage(`> ${prompt}`);
      this.commands[command].callback(args, this);
    } else {
      this.logMessage(`Unknown command: ${command}`);
    }
  }

  /**
   * Displays a list of available commands and their descriptions.
   * Iterates through the `commands` object and logs each command name
   * along with its description to the console.
   */
  help() {
    this.logMessage("Available commands:");
    Object.entries(this.commands).forEach(([name, { description }]) => {
      this.logMessage(`- ${name}: ${description}`);
    });
  }

  /**
   * Subscribes a function to a specific log ID.
   *
   * @param {string} id - The log ID to subscribe to.
   * @param {Function} callback - The function to execute when the log ID is triggered.
   */
  subscribe(id, callback) {
    if (!this.subscribers[id]) {
      this.subscribers[id] = [];
    }
    this.subscribers[id].push(callback);
  }

  /**
   * Simulates typing a message character by character with a specified speed and updates the message list.
   * Handles side effects based on log ID and payload.
   *
   * @param {string} message - The message to be logged.
   * @param {Object} options - Options for the log message.
   * @param {boolean} [options.typing=true] - Whether to simulate typing.
   * @param {number} [options.typingSpeed=50] - Typing speed in milliseconds per character.
   * @param {string} [options.id] - The log ID for triggering side effects.
   * @param {Object} [options.payload] - The payload to pass to subscribers.
   * @param {boolean} [options.waitForSideEffects=false] - Whether to wait for side effects to complete.
   * @param {string} [options.sideEffectExecution="serial"] - Execution mode for side effects ("serial" or "parallel").
   * @returns {Promise<void>} A promise that resolves when the typing and side effects are complete.
   */
  async logMessage(
    message,
    {
      typing = true,
      typingSpeed = 50,
      id,
      payload,
      waitForSideEffects = true,
      sideEffectExecution = "serial",
    } = {},
  ) {
    // Add the logMessage call to the queue
    const task = () =>
      this._processLogMessage(message, {
        typing,
        typingSpeed,
        id,
        payload,
        waitForSideEffects,
        sideEffectExecution,
      });
    this.messageQueue.push(task);

    // Process the queue if not already processing
    if (!this.isProcessingQueue) {
      this.isProcessingQueue = true;
      while (this.messageQueue.length > 0) {
        const nextTask = this.messageQueue.shift();
        await nextTask();
      }
      this.isProcessingQueue = false;
    }
  }

  async _processLogMessage(
    message,
    {
      typing,
      typingSpeed,
      id,
      payload,
      waitForSideEffects,
      sideEffectExecution,
    },
  ) {
    if (typing) {
      // Add an empty message to the list to start typing
      this.setMessages((prev) => [...prev, ""]);
      this.typing = true; // Set typing state to true
      const promise = new Promise((resolve) => {
        let currentMessage = "";
        const typeMessage = async () => {
          for (let i = 0; i < message.length; i++) {
            currentMessage += message[i];
            this.setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = currentMessage;
              return updatedMessages;
            });
            await new Promise((r) => setTimeout(r, typingSpeed));
          }
          this.typing = false; // Set typing state to false
          resolve(); // Resolve the promise when typing is complete
        };
        typeMessage();
      });

      await promise;
    } else {
      this.setMessages((prev) => [...prev, message]);
    }

    if (id && this.subscribers[id]) {
      const sideEffects = this.subscribers[id].map(
        (callback) => () => callback(payload),
      );

      if (waitForSideEffects) {
        if (sideEffectExecution === "serial") {
          for (const effect of sideEffects) {
            await effect();
          }
        } else {
          await Promise.all(sideEffects.map((effect) => effect()));
        }
      } else if (sideEffectExecution === "parallel") {
        Promise.all(sideEffects.map((effect) => effect()));
      } else {
        for (const effect of sideEffects) {
          effect();
        }
      }
    }
  }

  clearLog() {
    this.setMessages([]);
  }
}

/**
 * Context for managing the state and actions of the Command Center.
 * Provides a centralized way to share data and functionality across components.
 *
 * @type {React.Context<null | CommandCenter>}
 */
const CommandCenterContext = createContext(null);

/**
 * Provides a context for managing and interacting with a command center.
 *
 * This component initializes a shared `CommandCenter` instance and a `messages` state
 * to store command outputs. It also registers example commands such as "help" and "echo".
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 *
 * @returns {JSX.Element} A context provider that supplies the `commandCenter` instance
 * and `messages` state to its children.
 */
export const CommandCenterProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [commandCenter] = useState(() => new CommandCenter(setMessages));

  // Register example commands
  commandCenter.registerCommand(
    "help",
    "Show all available commands",
    (_, cc) => cc.help(),
  );
  commandCenter.registerCommand("echo", "Echo the input", (args, cc) =>
    cc.logMessage(args.join(" ")),
  );

  return (
    <CommandCenterContext.Provider value={{ commandCenter, messages }}>
      {children}
    </CommandCenterContext.Provider>
  );
};

/**
 * Custom hook to access the CommandCenter context.
 *
 * This hook provides access to the `commandCenter` object from the `CommandCenterContext`.
 * It must be used within a `CommandCenterProvider` to ensure the context is available.
 *
 * @throws {Error} If the hook is used outside of a `CommandCenterProvider`.
 * @returns {CommandCenter} The `commandCenter` object from the context.
 */
export const useCommandCenter = () => {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error(
      "useCommandCenter must be used within a CommandCenterProvider",
    );
  }
  return context.commandCenter;
};

/**
 * Custom hook to access the messages from the CommandCenterContext.
 *
 * @throws {Error} Throws an error if the hook is used outside of a CommandCenterProvider.
 * @returns {Array<string>} The messages from the CommandCenterContext as an array of strings.
 */
export const useMessages = () => {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error("useMessages must be used within a CommandCenterProvider");
  }
  return context.messages;
};

/**
 * Custom hook to register a listener for a specific log ID.
 *
 * This hook allows components to register a callback function that will be triggered
 * when a log message with the specified ID is logged.
 *
 * @param {string} id - The log ID to listen for.
 * @param {Function} callback - The function to execute when the log ID is triggered.
 */
export const useLogListener = (id, callback) => {
  const commandCenter = useCommandCenter();

  useEffect(() => {
    if (id && callback) {
      commandCenter.subscribe(id, callback);
    }
    return () => {
      // Cleanup: Remove the listener when the component unmounts
      if (id && commandCenter.subscribers[id]) {
        commandCenter.subscribers[id] = commandCenter.subscribers[id].filter(
          (fn) => fn !== callback,
        );
      }
    };
  }, [id, callback, commandCenter]);
};
