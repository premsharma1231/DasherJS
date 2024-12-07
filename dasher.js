let textarea = document.getElementById('input');
let textarea2 = document.getElementById('inputforOld');

textarea.addEventListener('input', function() {
    let input = textarea.value;
    console.log(input);
    const scheduleOld = parseSchedule(input);  // Parse the old time
    console.log(scheduleOld);
    const scheduleNew = collectStoreHours(textarea2.value);  // Parse the new time
    console.log(scheduleNew);
    
    // Compare the old and new schedules
    const result = compareTimes(scheduleOld, scheduleNew);
    console.log(result);
    document.getElementById('yeHhai').innerText = result;
});

textarea2.addEventListener('input', function() {
    let inputforOld = textarea2.value;
    console.log(inputforOld);
    const scheduleNew = collectStoreHours(inputforOld);  // Parse the new time
    console.log(scheduleNew);
    
    const scheduleOld = parseSchedule(textarea.value);  // Parse the old time
    console.log(scheduleOld);

    // Compare the old and new schedules
    const result = compareTimes(scheduleOld, scheduleNew);
    console.log(result);
    document.getElementById('yeHhai').innerText = result;
});

function parseSchedule(input) {
    const lines = input.trim().split("\n");
    const result = [];

    function formatTime(time) {
        const [timePart, period] = time.trim().split(/\s?(am|pm)/i);
        let [hours, minutes] = timePart.split(":").map(Number);

        if (period && period.toLowerCase() === "pm" && hours < 12) hours += 12;
        if (period && period.toLowerCase() === "am" && hours === 12) hours = 0;

        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes || 0;

        return `${formattedHours}:${formattedMinutes.toString().padStart(2, "0")} ${period ? period.toUpperCase() : ''}`;
    }

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);

        if (parts.length < 2) {
            continue;  // Skip lines that don't have both day and time
        }

        const day = parts[0];  // First part is the day
        const times = parts.slice(1).join(" ");  // Join the rest as the time

        if (!times || times.toLowerCase().includes("closed")) {
            result.push({ day: day.trim(), openTime: "Closed", closeTime: "Closed" });
        } else {
            const [openTime, closeTime] = times.split("–").map(formatTime);
            result.push({ day: day.trim(), openTime, closeTime });
        }
    }

    return result;
}

function collectStoreHours(input) {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const lines = input.split("\n").map(line => line.trim()).filter(line => line !== "");

    const result = allDays.map(day => ({
        day: day,
        openTime: 'Closed',
        closeTime: 'Closed'
    }));

    function formatTime(time) {
        const [timePart, period] = time.trim().split(/\s?(am|pm)/i);
        let [hours, minutes] = timePart.split(":").map(Number);

        if (period && period.toLowerCase() === "pm" && hours < 12) hours += 12;
        if (period && period.toLowerCase() === "am" && hours === 12) hours = 0;

        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes || 0;

        return `${formattedHours}:${formattedMinutes.toString().padStart(2, "0")} ${period ? period.toUpperCase() : ''}`;
    }

    // Check for "All Days" or a specific day input
    if (lines[0].toLowerCase() === "all days") {
        // If "All Days" is specified, apply the same hours to all days
        const openTime = formatTime(lines[1]);
        const closeTime = formatTime(lines[2]);
        allDays.forEach((day, index) => {
            result[index] = { day, openTime, closeTime };
        });
    } else {
        // Loop through the lines to process the input
        for (let i = 0; i < lines.length; i++) {
            const day = lines[i];
            if (allDays.includes(day)) {
                const openTime = formatTime(lines[i + 1]);
                const closeTime = formatTime(lines[i + 2]);
                const dayIndex = allDays.indexOf(day);

                result[dayIndex] = { day, openTime, closeTime };
                i += 2; // Skip the next two lines (openTime, closeTime)
            }
        }
    }
    return result;
}  





























let remarks = [];
function compareTimes(a, b) {

    for (let i = 0; i < a.length; i++) {
        let aDay = a[i];
        let bDay = b[i];

        if (!aDay || !bDay) {
            remarks.push(`${aDay.day} not found in one of the arrays.`);
            continue;
        }

        let openTimeExtending = new Date(`01/01/2000 ${bDay.openTime}`) < new Date(`01/01/2000 ${aDay.openTime}`);
        let closeTimeExtending = new Date(`01/01/2000 ${bDay.closeTime}`) > new Date(`01/01/2000 ${aDay.closeTime}`);
        let openTimeReducing = new Date(`01/01/2000 ${bDay.openTime}`) > new Date(`01/01/2000 ${aDay.openTime}`);
        let closeTimeReducing = new Date(`01/01/2000 ${bDay.closeTime}`) < new Date(`01/01/2000 ${aDay.closeTime}`);

        if (openTimeReducing && closeTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(Full Day): From ${aDay.openTime}-${aDay.closeTime} to ${bDay.openTime}-${bDay.closeTime}.\n`);
        } else if (openTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(Opening Time): From ${aDay.openTime} to ${bDay.openTime}.\n`);
        } else if (closeTimeReducing) {
            remarks.push(`Reduce - Hours Change: ${aDay.day}(End Time): From ${aDay.closeTime} to ${bDay.closeTime}.\n`);
        } else if (openTimeExtending && closeTimeExtending) {
            remarks.push(`Extend - ${aDay.day} full time is ${bDay.openTime} - ${bDay.closeTime} (We have ${aDay.openTime} - ${aDay.closeTime}).\n`);
        } else if (openTimeExtending) {
            remarks.push(`Extend - ${aDay.day} open time is ${bDay.openTime} (We have ${aDay.openTime}).\n`);
        } else if (closeTimeExtending) {
            remarks.push(`Extend - ${aDay.day} end time is ${bDay.closeTime} (We have ${aDay.closeTime}).\n`);
        } 
        // else if (openTimeExtending && closeTimeReducing) {
        //     // Only open time is extending, and close time is reducing
        //     remarks.push(`${aDay.day} open time is ${bDay.openTime} (We have ${aDay.openTime}), Reducing - Monday(End Time): From ${aDay.closeTime} to ${bDay.closeTime}.`);
        // } else if (openTimeReducing && closeTimeExtending) {
        //     // Only close time is extending, and open time is reducing
        //     remarks.push(`${aDay.day} end time is ${bDay.closeTime} (We have ${aDay.closeTime}).`);
        // }
        //  else if (!openTimeExtending && !closeTimeExtending && !openTimeReducing && !closeTimeReducing) {
        //     // No changes, no remarks
        //     remarks.push(`${aDay.day} - No Change in Hours.`);
        // }
    }

    // Return remarks for all days
    return remarks.length > 0 ? remarks.join(" ") : "No changes in hours.";
}

// Example arrays
let a = [
    { day: 'Monday', openTime: '11:00 AM', closeTime: '9:00 PM' },
    { day: 'Tuesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
    { day: 'Wednesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
];
let b = [
    { day: 'Monday', openTime: '11:00 AM', closeTime: '9:00 PM' },
    { day: 'Tuesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
    { day: 'Wednesday', openTime: '10:00 AM', closeTime: '9:00 PM' },
];

// Call the function
let result = compareTimes(a, b);
console.log(result);
document.getElementById('yeHhai').innerText = result;