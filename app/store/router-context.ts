import { createContext as createRouterContext } from 'react-router'

// import type { User } from "~/types";

// Server-side context for user authentication
export const userContext = createRouterContext<{ id: number } | null>(null)
