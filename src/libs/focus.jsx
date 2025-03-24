import React, { createContext, useContext, useState } from 'react';

const FocusContext = createContext();
const FocusUpdateContext = createContext();

const hierarchy = ['sun', 'planet', 'moon', 'site'];

export function FocusProvider({ children }) {
    const [focusStack, setFocusStack] = useState([{ id: 0, type: '' }]); // Initial focus is the Sun

    const pushFocus = (focus) => {
        setFocusStack((prevStack) => {
            const focusIndex = hierarchy.indexOf(focus.type);

            // If the focus type is not valid, return the current stack
            if (focusIndex === -1) return prevStack;

            // Find the last valid focus in the stack
            const lastValidIndex = prevStack.findIndex(
                (item) => hierarchy.indexOf(item.type) >= focusIndex
            );

            // If a higher or equal focus exists, truncate the stack
            const newStack =
                lastValidIndex !== -1
                    ? prevStack.slice(0, lastValidIndex)
                    : prevStack;

            // Add the new focus to the stack
            return [...newStack, focus];
        });
    };

    const popFocus = () => {
        setFocusStack((prevStack) =>
            prevStack.length > 1 ? prevStack.slice(0, -1) : prevStack
        );
    };

    const currentFocus = focusStack[focusStack.length - 1];

    return (
        <FocusContext.Provider value={currentFocus}>
            <FocusUpdateContext.Provider value={{ pushFocus, popFocus }}>
                {children}
            </FocusUpdateContext.Provider>
        </FocusContext.Provider>
    );
}

export function useFocus() {
    return useContext(FocusContext);
}

export function useFocusUpdate() {
    return useContext(FocusUpdateContext);
}
