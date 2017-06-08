(function () {
    let durationTest = parseFloat(document.getElementById('durationTest').value) || 30; // seeking precise timing
    let timeOffset = 10; // seeking precise timing

    function init() {
        bindEvents();
    }

    function bindEvents() {
        let mainButton = document.getElementById("generate");
        mainButton.addEventListener("click", function (event) {
            event.preventDefault();
            renderCommands();
        }, false);
    }

    function getFilters() {
        let filters = [];
        let cmd_filters = '';
        let vf_scale = 'scale=1280:-1';
        let vf_crop = 'crop=in_w-8:in_h-8';
        let vf_unsharp = 'unsharp=5:5:2';

        if (document.getElementById('crop').checked) { filters.push(vf_crop); }
        if (document.getElementById('720p').checked) { filters.push(vf_scale); }
        if (document.getElementById('unsharp').checked) { filters.push(vf_unsharp); }
        if (filters.length > 0) {
            cmd_filters = '-filter:v "' + filters.join(',') + '"';
        }
        return cmd_filters;
    }

    function formatMomentTime(duration) {
        let d = moment.duration(duration);
        let formatted = moment.utc(d.as('milliseconds')).format('HH:mm:ss.S');

        return formatted;
    }

    function calculateDuration() {
        let start = document.getElementById('startTime').value;
        let end = document.getElementById('endTime').value;

        let startSec = moment.duration(start);
        let calculated = moment.duration(end).subtract(startSec);

        return formatMomentTime(calculated);
    }

    function calculateStartOffset() {
        let start = document.getElementById('startTime').value;

        let offset = moment.duration(timeOffset, 'seconds');
        let calculated = moment.duration(start).subtract(offset);

        return formatMomentTime(calculated);
    }

    function calculateEndOffset() {
        let end = document.getElementById('endTime').value;

        let dt = moment.duration(durationTest, 'seconds');
        let calculated = moment.duration(end).subtract(dt);

        return formatMomentTime(calculated);
    }

    function calculateSpecificOffset() {
        let offset = moment.duration(timeOffset, 'seconds');

        return formatMomentTime(offset);
    }

    function calculateDurationTest() {
        let dt = moment.duration(durationTest, 'seconds');
        return formatMomentTime(dt);
    }

    function formatOutputFilename(suffix) {
        let filename = document.getElementById('outputFilename').value;
        let filenameParts = filename.split('.');

        if (suffix) {
            let filename = filenameParts[0] + '_' + suffix + '.' + filenameParts[1];
        }

        return filename;
    }

    function renderCommands() {
        let startOffset = calculateStartOffset();
        let inputFilename = document.getElementById('inputFilename').value;
        let specificOffset = calculateSpecificOffset();
        let durationTest = calculateDurationTest();
        let filters = getFilters();
        let outputFilenameStartTest = formatOutputFilename('start');
        let endOffset = calculateEndOffset();
        let duration = calculateDuration();
        let outputFilename = formatOutputFilename();
        let outputFilenameEndTest = formatOutputFilename('end');

        let cmdStartTest = `ffmpeg -ss ${startOffset} -i ${inputFilename} -ss ${specificOffset} -t ${durationTest} -c:a copy -c:v libx264 ${filters} -preset fast -crf 25 -y ${outputFilenameStartTest}`;
        let cmdEndTest = `ffmpeg -ss ${endOffset} -i ${inputFilename} -t ${durationTest} -c:a copy -c:v libx264 ${filters} -preset fast -crf 25 -y ${outputFilenameEndTest}`;
        let cmd = `ffmpeg -ss ${startOffset} -i ${inputFilename} -ss ${specificOffset} -t ${duration} -c:a copy -c:v libx264 ${filters} -preset slow -crf 25 ${outputFilename}`;

        document.getElementById('cmdStartTest').value = cmdStartTest;
        document.getElementById('cmdEndTest').value = cmdEndTest;
        document.getElementById('cmd').value = cmd;
    }

    init();

})();
