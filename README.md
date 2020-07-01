# DEPRECATED
**This plugin relies on the v1 version of the Wink API. In order to use it, you will need an account with Wink that can access the v1 API.**

# Homebridge Pivot Power Genius

This [Homebridge](https://github.com/nfarina/homebridge) plugin allows to control your [Pivot Power Genius](https://www.amazon.com/Quirky-PPVG-WH01-Pivot-Power-Genius/dp/B00GN92MC6/ref=sr_1_1?ie=UTF8&qid=1477958522&sr=8-1&keywords=quirky+pivot+power+genius).

## Setup
- [Install homebridge](https://github.com/nfarina/homebridge#installation)
- Install this plugin: `$ npm install -g homebridge-pivot-power-genius`

## Configuration

First, you should obtain access to the Wink API (by sending a request to questions@wink.com).

```json
"platforms": [
  {
    "platform": "Wink Pivot Power Genius",
    "name": "Wink Pivot Power Genius",
    "client_id": "<replace_with_your_client_id>",
    "client_secret": "<replace_with_your_client_secret>",
    "username": "<replace_with_your_wink_username>",
    "password": "<replace_with_your_wink_password>",
    "outlets": [
      {
        "uuid":"<an_outlet_uuid>",
        "hapService": "Lightbulb",
        "name": "Light"
      }
    ]
  }
]
```

Note about the `outlets` property:
- it should be defined as an array (`[]`), but don't necessary need to contain any value.
- it can contains objects (`{}`) representing overrides for given outlets.
- properties that matters:
  - `uuid` can be found by running homebridge with the command `$ DEBUG=wink:http homebridge` and observing the console output. Objects with the property `object_type` set to `outlet` contains a property `uuid` - this is the one you need.
  - `hapService` defaults to `Outlet` and can optionally be replaced by a different service. This becomes handy if your outlet controls a lightbulb, and you want it to appear as such in your HomeKit app.
  - `name` defaults to the name set in the wink app.
