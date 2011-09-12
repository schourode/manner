var parser = /^(\S+)\s*-\s*(\S+)\s+([^:]+):([^)]+)$/,
    groups = {
        'Barista': ['Christian','Julie','Luise','Mai','Morten','Uncas'],
        'Guide': ['Margrethe','Malene','Maria'],
        'P-vagt': ['Emil','J\u00f8rn','Rie','Jonathan'],
        'Madhold': ['Anne','Kristine'],
        'Alle': ['Barista','Guide','P-vagt','Madhold'],
        'Hejk': ['Uncas','Mai','Emil','Jonathan','Julie']
    },
    colors = {
        'Alle' : '#f39',
        'Barista': '#909',
        'Fraværende': '#999',
        'Frokost': '#930',
        'Hejk': '#c00',
        'Lejrbål': '#669',
        'P-vagt': '#393'
    };

var table = $('#persons'),
    thead = $('<thead>').appendTo(table),
    headerRow = $('<tr>').appendTo(thead).append('<td>'),
    tbody = $('<tbody>').appendTo(table),
    startHour = 7,
    intervalCount = 32;

for (var i = 0; i < intervalCount; i++) {
    var decimal = i / 2 + startHour,
        hours = Math.floor(decimal),
        minutes = decimal % 1 ? '30' : '00',
        label = hours + ':' + minutes;
        
    $('<th>').appendTo(headerRow).text(label);
}

function loadData(hash) {
    tbody.empty();
    
    $('h1 a').removeClass('selected')
        .filter('[href="' + hash + '"]').addClass('selected');
    
    $.get('data/' + hash.substring(1) + '.txt', function (data) {
        var persons = parseData(data);
        renderTable(persons);
    });
}

function parseData(data) {
    var lines = data.split('\n'),
        persons = {};
    
    for (var i in lines) {
        var tokens = lines[i].match(parser),
            entry = {
                start: parseTime(tokens[1]),
                end: parseTime(tokens[2]),
                text: tokens[3].trim()
            },
            atendees = _(tokens[4].split(',')).map(function (x) { return x.trim(); });
            
        entry.color = colors[entry.text] || colors[atendees[0]] || '#36c';
        
        while (atendees.length > 0) {
            var name = atendees.pop();
            if (groups[name]) {
                atendees = atendees.concat(groups[name]);
                continue;
            }
            
            if (!persons[name]) {
                persons[name] = [];
            }
            
            persons[name].push(entry);
        }
    }
    
    return persons;
}

function parseTime(text) {
    var tokens = text.split(':'),
        hours = parseInt(tokens[0], 10),
        minutes = parseInt(tokens[1], 10),
        decimal = hours + minutes / 60;
    
    return Math.round(2 * ( decimal - startHour ));
}

function renderTable(persons) {
    var names = _(persons).keys().sort();
    
    _(names).each(function (name) {
        var row = $('<tr>').appendTo(tbody),
            queue = _(persons[name]).sortBy(function (x) { return x.start; }),
            pointer = 0;
        
        $('<th>').text(name).appendTo(row);
        
        while (queue.length > 0) {
            var entry = queue.shift(),
                duration = entry.end - Math.max(entry.start, pointer);
                
            if (duration < 1) continue;
            
            while (pointer < entry.start) {
                row.append('<td>');
                pointer++;
            }
            
            $('<td>')
                .appendTo(row)
                .text(entry.text)
                .attr('colspan', duration)
                .css('background', entry.color)
                .css('font-size', Math.min(100, 40 + Math.ceil(300 * duration / entry.text.length)) + '%');
            
            pointer += duration;
        }
        
        while (pointer < intervalCount) {
            row.append('<td>');
            pointer++;
        }
    });
}

$(window).bind('hashchange', function () {
    loadData(location.hash);
});

if (location.hash) {
    loadData(location.hash);
}
else {
    var now = new Date(),
        day = now.getDay(),
        hash = $('h1 a').eq(day).attr('href');
    
    loadData(hash);
}