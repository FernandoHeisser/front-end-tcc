import Stock from "./Stock";
import User from "./User";

interface Session {
    user: User,
    stocks: Stock[]
}

export default Session;