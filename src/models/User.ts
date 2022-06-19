import Stock from "./Stock";

interface User {
    _id?: string,
    stocks: Stock[]
}

export default User;