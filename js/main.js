(function () {
    let durationTest = parseFloat(document.getElementById('durationTest').value) || 30; // seeking precise timing
    let timeOffset = 10; // seeking precise timing

    function init() {
        bindEvents();
    }

    function bindEvents() {
        bindGenerateBtn();
        bindNavClick();
    }

    function bindNavClick() {
        let navSingleBtn = document.getElementById("navSingle");
        let navMultiBtn = document.getElementById("navMulti");

        navSingleBtn.addEventListener("click", function (event) {
            event.preventDefault();
            document.getElementById("mainForm").className = "form-horizontal single";
        }, false);

        navMultiBtn.addEventListener("click", function (event) {
            event.preventDefault();
            document.getElementById("mainForm").className = "form-horizontal multiline";
        }, false);
    }

    function bindGenerateBtn() {
        let mainButton = document.getElementById("generate");
        mainButton.addEventListener("click", function (event) {
            event.preventDefault();

            if (document.querySelector('form.multiline') !== null) {
                // multiline
                renderMultiline();
            } else {
                // single
                renderSingle();
            }
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
        let formatted = moment.utc(d.as('milliseconds')).format('HH:mm:ss.SSS');

        return formatted;
    }

    function calculateDuration(start, end) {
        let startSec = moment.duration(start);
        let calculated = moment.duration(end).subtract(startSec);

        return formatMomentTime(calculated);
    }

    function calculateStartOffset(start) {
        let offset = moment.duration(timeOffset, 'seconds');
        let calculated = moment.duration(start).subtract(offset);

        return formatMomentTime(calculated);
    }

    function calculateEndOffset(end) {
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

    function formatOutputFilename(filename) {
        return filename+'.mp4';
    }

    function renderSingle() {
        let startOffset = calculateStartOffset( document.getElementById('startTime').value );
        let specificOffset = calculateSpecificOffset();
        let durationTest = calculateDurationTest();
        let filters = getFilters();
        let endOffset = calculateEndOffset( document.getElementById('endTime').value );
        let duration = calculateDuration( document.getElementById('startTime').value, document.getElementById('endTime').value );

        // filenames
        let inputFilename = document.getElementById('inputFilename').value;
        let outputFilename = formatOutputFilename( document.getElementById('outputFilename').value );
        let outputFilenameStartTest = formatOutputFilename('start');
        let outputFilenameEndTest = formatOutputFilename('end');

        let cmdStartTest = `ffmpeg -ss ${startOffset} -i "${inputFilename}" -ss ${specificOffset} -t ${durationTest} -c:a copy -c:v libx264 ${filters} -preset fast -crf 25 -y "${outputFilenameStartTest}"`;
        let cmdEndTest = `ffmpeg -ss ${endOffset} -i "${inputFilename}" -t ${durationTest} -c:a copy -c:v libx264 ${filters} -preset fast -crf 25 -y "${outputFilenameEndTest}"`;
        let cmd = `ffmpeg -ss ${startOffset} -i "${inputFilename}" -ss ${specificOffset} -t ${duration} -c:a copy -c:v libx264 ${filters} -preset slow -crf 25 "${outputFilename}"`;

        document.getElementById('cmdStartTest').value = cmdStartTest;
        document.getElementById('cmdEndTest').value = cmdEndTest;
        document.getElementById('cmd').value = cmd;
    }

    function renderMultiline() {
        // clean up output textarea
        document.getElementById('cmd').value = '';

        let times = document.getElementById('times').value;
        let lines = times.split("\n\n");

        lines.forEach(function(element) {
            console.log(element);

            generateEpisode(element);
        }, this);
    }

    function generateEpisode(episode) {
        let lines = episode.split("\n");

        let filename = lines[0];
        let startTime = lines[1];
        let endTime = lines[2];

        if(filename !== '' && startTime !== '' && endTime !== '') {

            let startOffset = calculateStartOffset( startTime );
            let specificOffset = calculateSpecificOffset();
            let filters = getFilters();
            let duration = calculateDuration( startTime, endTime );
            let inputFilename = document.getElementById('inputFilename').value;
            let outputFilename = formatOutputFilename( filename );

            let cmd = `ffmpeg -ss ${startOffset} -i "${inputFilename}" -ss ${specificOffset} -t ${duration} -c:a copy -c:v libx264 ${filters} -preset slow -crf 25 "${outputFilename}"`;

            document.getElementById('cmd').value += cmd + "\n";        
        }
    }

    init();

})();
