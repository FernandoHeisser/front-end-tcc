import UserStock from './UserStock';

interface User {
    _id?: string,
    stocks: UserStock[]
}

export default User;