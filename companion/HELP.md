Official module for controlling your events with Internet Clicker. If you have any questions or requests, please don't hesitate to get in touch at [info@internetclicker.com](mailto:info@internetclicker.com).

### Features

- Control the slideshow yourself
- Control whether up to 10 presenters can click
- Send timers to your presenters
- Broadcast messages to all presenters

## Configuration

You will need your Key and the Code of the event you want to control. Upon pressing Save it will attempt to connect, so if the Code is not yet active (you haven't connected from the client app) it will not connect. You can add a button with an action to initiate the connection when you know your Code is ready to be controlled.

## Actions

##### Connect to Code

Connects to the Internet Clicker service (if not already connected).

##### Disconnect from Code

Disconnects the currently active connection to the Internet Clicker service.

##### Next Slide

Will send a Next (right arrow) command to the connected client(s).

##### Previous Slide

Will send a Previous (left arrow) command to the connected client(s).

##### Send Message

Sends the given message to all connected presenters.

##### Start Timer

Starts the timer with the given minutes and seconds. Can also configure whether the timer will begin counting up after it has completed.

##### Stop Timer

Stops the active timer.

##### Pause Timer

Pauses the active timer.

##### Add/Minus Timer

Changes the active timer, adding or minusing the given minutes and seconds.

##### Control Presenter Access

This will enable controlling whether presenters can click. Disabling will enable all presenters to click.

##### Toggle Presenter Status

Will enable or disable whether a presenter at the given index can click.

##### Prompt For Names

If "Control Presenter Access" was enabled after presenters joined they may not have had to enter a name, this will prompt those presenters to provide a name.

## Feedbacks

##### Control Presenter Access

This boolean feedback will be true if Control Presenter Access is enabled, false if disabled. Most commonly combined with the "Control Presenter Access" action.

##### Toggle Presenter Status

This advanced feedback reacts to the current state of the presenter at the given index. There are 3 possible states:
 - NotConnected - when no presenter at the given index is connected
 - Active - when the connected presenter at the given index can click
 - Inactive - when the connected presenter at the given index can *not* click

You can set the text and background color for each of these states.

##### Connection State

This advanced feedback reacts to the state of the connection with the Internet Clicker service. There are 3 possible states:
 - Disconnected
 - Connected
 - Connecting - this state is mostly only displayed when a connection is lost and it is attempting to reconnect, unless connecting takes a long time

You can set the text and background color for each of these states.

## Variables

Please check the Internet Clicker variables page for a full list of all available variables.

---

## Changelog

__0.1.0__
Initial release.