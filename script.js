let appData = {}

$(() => {
    $.ajax({
        url: 'data.json',
        dataType: 'json'
    })
    .done(data => {
        console.log('Data loaded successfully:', data)
        appData = data;
        renderData(undefined, 'device1')
    })
    .fail(error => console.error('Error loading data:', error))
})