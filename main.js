var parser = /^((\S+)\s*-\s*(\S+))\s+([^:]+):([^)]+)$/,
    groups = {
        'Barista': ['Christian','Ida','Jonathan','Julie','Luise','Mai','Maj','Michael','Morten','Uncas'],
        'Guide': ['Christian','Kim','Malene','Margrethe','Maria'],
        'P-vagt': ['Asti','Emil','J\u00f8rn','Rie','Stald'],
        'Mad': ['Anne','Kristine','Signe'],
        'Alle': ['Barista','Guide','P-vagt','Mad'],
        'Hejk': ['Uncas','Mai','Emil','Jonathan','Julie']
    },
    colors = {
        'Administration' : '#999',
        'Alle' : '#f39',
        'Banket': '#036',
        'Barista': '#909',
        'Fraværende': '#999',
        'Frokost': '#930',
        'Hejk': '#c30',
        'K\u00f8kken': '#0af',
        'Lejrbål': '#669',
        'Natl\u00f8b': '#336',
        'Opvask': '#0af',
        'Oprydning': '#f63',
        'P-vagt': '#393',
        'P-møde': '#066',
        'Settlers': '#336'
    };

var personSelect = $('select[name="person"]'),
    daySelect = $('select[name="day"]'),
    table = $('#persons'),
    thead = $('<thead>').appendTo(table),
    headerRow = $('<tr>').appendTo(thead).append('<td>'),
    tbody = $('<tbody>').appendTo(table),
    startHour = 7,
    intervalCount = 32,
    now = new Date();

for (var i = 0; i < intervalCount; i++) {
    var decimal = i / 2 + startHour,
        hours = Math.floor(decimal),
        minutes = decimal % 1 ? '30' : '00',
        label = hours + ':' + minutes;
        
    $('<th>').appendTo(headerRow).text(label);
}

function loadData(file) {
    tbody.empty();
    
    $.get('data/' + file + '.txt', function (data) {
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
                when: tokens[1],
                start: parseTime(tokens[2]),
                end: parseTime(tokens[3]),
                text: tokens[4].trim(),
                who: tokens[5]
            },
            atendees = _(entry.who.split(',')).map(function (x) { return x.trim(); });
            
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
    var names = _(persons).keys().sort(),
        currentCol = parseTime(now.getHours() + ':' + now.getMinutes());
    
    personSelect.empty();
    
    _(names).each(function (name) {
        var option = $('<option>').text(name).appendTo(personSelect),
            row = $('<tr>').appendTo(tbody),
            queue = persons[name],
            pointer = 0;
        
        if (name === $.cookie('person')) {
            option.attr('selected', true);
        }
        
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
                .attr('data-when', entry.when)
                .attr('data-who', entry.who)
                .attr('colspan', duration)
                .css('background', entry.color)
                .css('font-size', Math.min(100, 40 + Math.ceil(300 * duration / entry.text.length)) + '%')
                .toggleClass('past', entry.end <= currentCol)
                .toggleClass('now', entry.end > currentCol && !row.children().is('.now'));
            
            pointer += duration;
        }
        
        while (pointer < intervalCount) {
            row.append('<td>');
            pointer++;
        }
    });
    
    personSelect.change();
}

if ($.cookie('day')) {
    daySelect.val($.cookie('day'));
}
else {
    daySelect.children().eq(now.getDay()).attr('selected', true);
}

daySelect.change(function () {
    loadData($(this).val());
    $.cookie('day', $(this).val());
}).change();

personSelect.change(function () {
    var index = $(this).children('[selected]').index();
    tbody.children().removeClass('selected').eq(index).addClass('selected');
    $.cookie('person', $(this).val(), { expires: 30 });
});

$('header select').yaselect();

$('body').addClass('ready');