// Before the run, activate the local server and restore the documents ***********************
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("./index");
// tests to execute ***************************************************************************
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const DARK_GRAY = "\x1b[38;5;238m";
const DARKER_GRAY = "\x1b[38;5;235m";  // Darker than dark gray
let FinalPrint = '\x1Bc\n';
// functions **********************************************************************************
function generateUserTable(response1, response2, response3, response4, response5,all_different_files) {
    let output = ""; // Initialize the output string to accumulate the table
    // Iterate over all unique Event IDs from the responses
    const eventIds = [...new Set([
      ...response1.map(group => group.eventId[0]),
      ...response2.map(group => group.eventId[0]),
      ...response3.map(group => group.eventId[0]),
      ...response4.map(group => group.eventId[0]),
      ...response5.map(group => group.eventId[0])
    ])];
      output += `${DARK_GRAY}-`.repeat(156) + RESET; output += "\n";
      output +=`\t > ${CYAN}Call to /groups/create ${RESET}\n`
      output += `\t >> ${CYAN}Groups created by 5 consecutive calls to POST(GROUPS/CREATE)${RESET}\n`;
      output += `${DARK_GRAY}-`.repeat(156) + RESET; output += "\n";
    // Loop over each Event ID and format the corresponding groups
    eventIds.forEach(eventId => {
        output += `\t\t > ${BOLD}${CYAN}EventID: ${eventId}${RESET}\n`;
        output += `${DARKER_GRAY}-`.repeat(156) + RESET; // Repeating dashes in smoke gray
        output += "\n";
      // Collect all groups for this event from all responses
      const groups = [response1, response2, response3, response4, response5].map(response => 
          response.filter(group => group.eventId[0] === eventId)
      );
        // Determine the unique group numbers for this event
        const uniqueGroupNumbers = new Set();
        groups.forEach(groupList => {
            groupList.forEach(group => {
                uniqueGroupNumbers.add(group.groupNumber);
            });
        });
      // Loop over each unique group number and construct the output
      Array.from(uniqueGroupNumbers).sort((a, b) => a - b).forEach(groupNumber => {
        const groupUsers = groups.map((group, index) => 
            group.find(g => g.groupNumber === groupNumber)?.users.join('  ') || "N/A"
        );
        // Add the users' data for each group from all responses
        groupUsers.forEach((users, index) => {
            output += `${BOLD}${DARKER_GRAY}Users Group${groupNumber} - response ${index + 1}:${RESET} ${users}\n`;
        });
        output += `${DARKER_GRAY}-`.repeat(156) + RESET; // Repeating dashes in smoke gray
        output += "\n";
      });
    });
      output += `${BOLD}${DARKER_GRAY}Result of comparison among all the combination of group. | true if all different | false if there is a match ${RESET}\n`;
      output += `\t\t\t${BOLD}${YELLOW} Result: ${all_different_files} ${RESET}\n`;
      output += `${DARKER_GRAY}-`.repeat(156) + RESET; // Repeating dashes in smoke gray
  return output;
}
// Connect to MongoDB dump in local ***********************************************************
beforeAll(async () => {
  const mongoURI = "mongodb://127.0.0.1:27017/final-proyect-db";
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
// TESTS **************************************************************************************
  describe("Call to /groups/showall", () => {
    it("should fetch all groups from the database", async () => {
      const num_groups_expected = 21;
        let toPrint = "";
        const response              = await request(app).post("/groups/showall");
        numberOfElements = response.body.length;
          toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
          toPrint +=`\t > ${CYAN}Call to /groups/showall ${RESET}\n`
          toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
          toPrint += `${DARKER_GRAY}Groups received: ` + RESET + numberOfElements + '\n' +
                      `${DARKER_GRAY}Groups expected: ` + RESET + num_groups_expected + '\n'
          toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
          FinalPrint+= toPrint;
          console.info(toPrint)
            expect(response.status).toBe(200);
            expect(numberOfElements).toBe(num_groups_expected);
    });
  });
  describe("5 Calls to /groups/create", () => {
    it("should create a new set of groups with 5 calls to create", async () => {
      const responses = []
        responses[0]    = await request(app).post('/groups/create').expect(200);
        responses[1]    = await request(app).post('/groups/create').expect(200);
        responses[2]    = await request(app).post('/groups/create').expect(200);
        responses[3]    = await request(app).post('/groups/create').expect(200);
        responses[4]    = await request(app).post('/groups/create').expect(200);
    let all_different_files = true;
    for (let i = 0; i < responses.length; i++) {
        for (let j = i + 1; j < responses.length; j++) {
            if (JSON.stringify(responses[i]) === JSON.stringify(responses[j])) {
                all_different_files = false;
            }
        }
    } 
      const result = generateUserTable(responses[0].body,responses[1].body, responses[2].body, responses[3].body,responses[4].body,all_different_files );
      FinalPrint+= result+'\n';
        expect(all_different_files).toBe(true);
    });
  });
  describe("Call to /groups/eraseall", () => {
    it("should cancel all groups from the database", async () => {
      const expected_answer = '18documents deleted successfully.';
        const responseErase0        = await request(app).post("/groups/eraseall");
        const respondCreate         = await request(app).post('/groups/create').expect(200);
        const respondCreate2        = await request(app).post('/groups/create').expect(200);
        const responseErase         = await request(app).post("/groups/eraseall");
        const respondCreate3        = await request(app).post('/groups/create').expect(200);
        let toPrint = "";
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        toPrint +=`\t > ${CYAN}Call to /groups/eraseall ${RESET}\n`
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        toPrint +=  `${DARKER_GRAY}text_back received: `+ RESET + responseErase.body.text_back + '\n' + 
        `${DARKER_GRAY}text_back expected: ` + RESET + expected_answer + '\n'
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        toPrint += `${DARKER_GRAY} 1 call to create is done after the test to restore the groups` + RESET; toPrint += "\n";
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        FinalPrint+= toPrint;
      expect(responseErase.status).toBe(200);
      expect(responseErase.body.text_back).toBe(expected_answer);
    });
  });
  describe("Sequence of Calls and checks on the groups", () => {
    it("should check the integrity of the groups creation", async () => {
        const responseShowAll0    = await request(app).post("/groups/showall").expect(200);
        const responseErase       = await request(app).post("/groups/eraseall").expect(200);
        const responseShowAll     = await request(app).post("/groups/showall").expect(200);
        const respondCreate       = await request(app).post('/groups/create').expect(200);
        const responseShowAll2    = await request(app).post("/groups/showall").expect(200);
        const respondCreate2      = await request(app).post('/groups/create').expect(200);
        const respondCreate3      = await request(app).post('/groups/create').expect(200);
        const responseShowAll3    = await request(app).post("/groups/showall").expect(200);
        const responseErase2      = await request(app).post("/groups/eraseall").expect(200);
        const responseShowAll4    = await request(app).post("/groups/showall").expect(200);
          let toPrint = "";
          toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
          toPrint +=`\t > ${CYAN}Sequence of Calls and checks on the groups${RESET}\n`
          toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        toPrint +=  `${DARKER_GRAY} 0 - call to showall   - Groups available on DB: `+ RESET + responseShowAll0.body.length + '\n';
        toPrint +=  `${DARKER_GRAY} 1 - call to eraseall  - text_back received    : `+ RESET + responseErase.body.text_back + '\n';
        toPrint +=  `${DARKER_GRAY} 2 - call to showall   - Groups available on DB: `+ RESET + responseShowAll.body.length + '\n';
        toPrint +=  `${DARKER_GRAY} 3 - call to create`+ RESET + '\n';
        toPrint +=  `${DARKER_GRAY} 4 - call to showall   - Groups available on DB: `+ RESET + responseShowAll2.body.length + '\n';
        toPrint +=  `${DARKER_GRAY} 5 - call to create`+ RESET + '\n';
        toPrint +=  `${DARKER_GRAY} 6 - call to create`+ RESET + '\n';
        toPrint +=  `${DARKER_GRAY} 7 - call to showall   - Groups available on DB: `+ RESET + responseShowAll3.body.length + '\n';
        toPrint +=  `${DARKER_GRAY} 8 - call to eraseall  - text_back received    : `+ RESET + responseErase2.body.text_back + '\n';
        toPrint +=  `${DARKER_GRAY} 9 - call to showall   - Groups available on DB: `+ RESET + responseShowAll4.body.length + '\n';
        toPrint += `${DARKER_GRAY}-`.repeat(156) + RESET; toPrint += "\n";
        FinalPrint+= toPrint;
      expect(responseShowAll.body.length).toBe(0);
      expect(responseShowAll2.body.length).toBe(9);
      expect(responseShowAll3.body.length).toBe(27);
      expect(responseShowAll4.body.length).toBe(0);
    });
  });
describe("Print the results from the tests", () => {
  it("will print the results from the tests", async () => {
    console.log(FinalPrint)
  });
});