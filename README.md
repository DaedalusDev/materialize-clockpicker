## Description:
This is a materialize clockpicker designed as an addition to http://materializecss.com/

Most source codes are taken from https://github.com/weareoutman/clockpicker

## Install:

### bower
`bower install materialize-clockpicker --save`

### npm
`npm i materialize-clockpicker --save`

## Options:
Here are some options and their defaults:
```
default: '',           // default time, 'now' or '13:14' e.g.
fromnow: 0,            // set default time to * milliseconds from now
donetext: 'Done',      // done button text
autoclose: false,      // auto close when minute is selected
ampmclickable: false,  // set am/pm button on itself
darktheme: false,      // set to dark theme
twelvehour: true,      // change to 12 hour AM/PM clock from 24 hour
vibrate: true,         // vibrate the device when dragging clock hand
container: '',          // default will append clock next to input
dismissible: true,		// dismissable
interval: false,		// set a time interval in minute / if 60, skip minute picker
min: null,				// set the min time. ex: [13, 30] for 13:30
max: null,				// set the max time. ex: [18, 30] for 18:30
disable: null			// disable time value. ex: [[8,30],[12],[14,0],[null,15]] for 8:30, 12:**, 14:30 and **:15
```

## Events:
```
init                    // After plugin init
beforeShow              // Before Show picker
afterShow               // After show picker
beforeHourSelect        // Before hour select
afterHourSelect         // After hour select
beforeDone              // Before Done
afterDone               // After done
```
### Usage
#### At plugin init
```
$('#myInput').pickatime({
    beforeShow: function(e, clockPicker) {
        // do someting
    }
});
```
#### After plugin init
```
$('#myInput').on('beforeShow.clockpicker', function(e, clockPicker) {
    // do someting
});
```

## Screenshots:
![Image of Materialize Clock Light](https://github.com/chingyawhao/materialize-clockpicker/blob/master/images/material-clock-light.PNG)
![Image of Materialize Clock Dark](https://github.com/chingyawhao/materialize-clockpicker/blob/master/images/material-clock-dark.PNG)


## Developing:
```
npm i gulp bower -g
npm install
bower install
gulp watch
```


## Getting started

### Basic setup

1. Make sure you have materialize css (including their JavaScript files): http://materializecss.com/

2. Install this package via npm or bower. Alternatively you can also download the [source](https://github.com/chingyawhao/materialize-clockpicker/tree/master/src) files and add them to your project manually.

3. Create an input field in your html code like the following:

  ```
  <div class="input-field col s12">
      <label for="timepicker">Time</label>
      <input id="timepicker" class="timepicker" type="time">
  </div>
  ```

3. Agregar valores por defecto al input

  ```
  <div class="input-field col s12">
      <label for="timepicker">Time</label>
      <input id="timepicker" data-default="14:20:00" class="timepicker" type="time">
  </div>
  ```

4. Add the Javascript trigger with the corresponding [options](https://github.com/chingyawhao/materialize-clockpicker#options)

  ```
  <script>
    $('#timepicker').pickatime({
      autoclose: false,
      twelvehour: false,
      default: '14:20:00'
    });
  </script>
  ```

5. Obtener la hora seleccionada y el elemento que ha sido manipulado

  ```
  <script>
    $('#timepicker').pickatime({
      autoclose: false,
      twelvehour: false,
      afterDone: function(Element, Time) {
          console.log(Element, Time);
      }
    });
  </script>
  ```

You can trigger the clock either by ID's or classes (useful if you have several clocks on one page).
