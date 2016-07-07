enum RoomStatus {
    WAITING_PLAYERS,
    PLAYING
}

namespace RoomStatus {
    export function isWaitingPlayers(room_state: RoomStatus) {
        return room_state === RoomStatus.WAITING_PLAYERS;
    }
}

export default RoomStatus;