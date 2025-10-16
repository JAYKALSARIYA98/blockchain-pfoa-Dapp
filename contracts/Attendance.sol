// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {
    struct AttendanceRecord {
        address student;
        uint256 timestamp;
        string location;
    }

    AttendanceRecord[] public records;
    mapping(address => uint256[]) public studentRecords;
    mapping(address => uint256) public lastMarkedDay; // unix day the student last marked

    address public owner;

    event AttendanceMarked(address indexed student, uint256 timestamp, string location);
    event SessionStarted(bytes32 indexed sessionCodeHash, uint256 expiresAt);
    event SessionEnded();

    bytes32 public sessionCodeHash; // keccak256(code)
    uint256 public sessionExpiresAt; // unix seconds; 0 = no session

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function startSession(string memory code, uint256 durationSeconds) external onlyOwner {
        require(bytes(code).length > 0, "empty code");
        require(durationSeconds > 0, "duration=0");
        sessionCodeHash = keccak256(abi.encodePacked(code));
        sessionExpiresAt = block.timestamp + durationSeconds;
        emit SessionStarted(sessionCodeHash, sessionExpiresAt);
    }

    function endSession() external onlyOwner {
        sessionCodeHash = bytes32(0);
        sessionExpiresAt = 0;
        emit SessionEnded();
    }

    function isSessionActive() public view returns (bool) {
        return sessionExpiresAt != 0 && block.timestamp <= sessionExpiresAt;
    }

    function markAttendance(string memory location, string memory code) public {
        require(isSessionActive(), "session inactive");
        require(keccak256(abi.encodePacked(code)) == sessionCodeHash, "invalid code");

        uint256 today = block.timestamp / 1 days;
        require(lastMarkedDay[msg.sender] != today, "already marked today");

        uint256 recordId = records.length;

        records.push(AttendanceRecord({
            student: msg.sender,
            timestamp: block.timestamp,
            location: location
        }));

        studentRecords[msg.sender].push(recordId);
        lastMarkedDay[msg.sender] = today;

        emit AttendanceMarked(msg.sender, block.timestamp, location);
    }

    function getRecordCount() public view returns (uint256) {
        return records.length;
    }

    function getStudentRecordCount(address student) public view returns (uint256) {
        return studentRecords[student].length;
    }

    function getStudentRecordIds(address student) public view returns (uint256[] memory) {
        return studentRecords[student];
    }
}
