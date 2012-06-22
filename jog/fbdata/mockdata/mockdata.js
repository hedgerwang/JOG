/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;

var MockData = {
  getTimelineSections: function() {
    var data = {
      "uid": "562910429",
      "562910429": {
        "id": "562910429",
        "timeline_sections": {
          "nodes": [
            {
              "label": "\u73fe\u5728",
              "timeline_units": {
                "nodes": [
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQB9hKXLDLArAcPM&w=180&h=180&url=http\u00253A\u00252F\u00252Fl2.yimg.com\u00252Fbt\u00252Fapi\u00252Fres\u00252F1.2\u00252FvUH7jHsXWhQc6sTZOq8kuw--\u00252FYXBwaWQ9eW5ld3M7Zmk9ZmlsbDtoPTE1MDtweG9mZj01MDtweW9mZj0wO3c9MTUw\u00252Fhttp\u0025253A\u00252F\u00252Fl.yimg.com\u00252Fos\u00252Fmit\u00252Fmedia\u00252Fp\u00252Fcommon\u00252Fimages\u00252Fy-bang-90323.png&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "I dream about to have a small backyard farm of our own, and we shall have ducks."
                      },
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQAr3kEvseiXg7Ip&w=180&h=180&url=http\u00253A\u00252F\u00252Fi4.ytimg.com\u00252Fvi\u00252FCWgbmgIzoT8\u00252Fmqdefault.jpg"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQCntQwD2YvXZ4VH&w=180&h=180&url=http\u00253A\u00252F\u00252Fi1.ytimg.com\u00252Fvi\u00252Fdpzu3HM2CIo\u00252Fmqdefault.jpg&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "I took the hipster quiz. You've definitely never heard of it.\r\n\r\n I scored 35\u0025, so I'm NOT a hipster. Only 2.5\u0025 of people are really hipsters.\r\n\r\n How hipster are you? www.HowHipsterAreYou.com\/2202998"
                      },
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/fbcdn-photos-a.akamaihd.net\/hphotos-ak-ash3\/7992_10151856099415430_838916927_a.jpg"
                            },
                            "message": {
                              "text": "I took the hipster quiz. You've definitely never heard of it.\r\n\r\n I scored 35\u0025, so I'm NOT a hipster. Only 2.5\u0025 of people are really hipsters.\r\n\r\n How hipster are you? www.HowHipsterAreYou.com\/2202998"
                            }
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "label": "6 \u6708",
              "timeline_units": {
                "nodes": [
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQB9hKXLDLArAcPM&w=180&h=180&url=http\u00253A\u00252F\u00252Fl2.yimg.com\u00252Fbt\u00252Fapi\u00252Fres\u00252F1.2\u00252FvUH7jHsXWhQc6sTZOq8kuw--\u00252FYXBwaWQ9eW5ld3M7Zmk9ZmlsbDtoPTE1MDtweG9mZj01MDtweW9mZj0wO3c9MTUw\u00252Fhttp\u0025253A\u00252F\u00252Fl.yimg.com\u00252Fos\u00252Fmit\u00252Fmedia\u00252Fp\u00252Fcommon\u00252Fimages\u00252Fy-bang-90323.png&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "I dream about to have a small backyard farm of our own, and we shall have ducks."
                      },
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQAr3kEvseiXg7Ip&w=180&h=180&url=http\u00253A\u00252F\u00252Fi4.ytimg.com\u00252Fvi\u00252FCWgbmgIzoT8\u00252Fmqdefault.jpg"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQCntQwD2YvXZ4VH&w=180&h=180&url=http\u00253A\u00252F\u00252Fi1.ytimg.com\u00252Fvi\u00252Fdpzu3HM2CIo\u00252Fmqdefault.jpg&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "I took the hipster quiz. You've definitely never heard of it.\r\n\r\n I scored 35\u0025, so I'm NOT a hipster. Only 2.5\u0025 of people are really hipsters.\r\n\r\n How hipster are you? www.HowHipsterAreYou.com\/2202998"
                      },
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/fbcdn-photos-a.akamaihd.net\/hphotos-ak-ash3\/7992_10151856099415430_838916927_a.jpg"
                            },
                            "message": {
                              "text": "I took the hipster quiz. You've definitely never heard of it.\r\n\r\n I scored 35\u0025, so I'm NOT a hipster. Only 2.5\u0025 of people are really hipsters.\r\n\r\n How hipster are you? www.HowHipsterAreYou.com\/2202998"
                            }
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "label": "5 \u6708",
              "timeline_units": {
                "nodes": [
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQC3S8WpkjP3vTeL&w=180&h=180&url=http\u00253A\u00252F\u00252Fi3.ytimg.com\u00252Fvi\u00252FZhQNS-wdK1Q\u00252Fhqdefault.jpg"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQCKUn5NGhwuEu5O&w=180&h=180&url=http\u00253A\u00252F\u00252Fi3.ytimg.com\u00252Fvi\u00252FJnD0daTCcbg\u00252Fmqdefault.jpg&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQA-gsepuHiODGVC&w=180&h=180&url=http\u00253A\u00252F\u00252Ftankr.net\u00252Fs\u00252Fmedium\u00252FPMRU.jpg&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/fbcdn-photos-a.akamaihd.net\/hphotos-ak-ash3\/582344_10151790235760430_1611998841_a.jpg"
                            },
                            "message": {
                              "text": ""
                            }
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/www.intern.facebook.com\/safe_image.php?d=AQDogYFSgaC-2634&w=180&h=180&url=http\u00253A\u00252F\u00252Fi2.ytimg.com\u00252Fvi\u00252FuxmVQR80BT0\u00252Fmqdefault.jpg&crop"
                            },
                            "message": null
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "label": "2012\u5e74",
              "timeline_units": {
                "nodes": [
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "http:\/\/instagr.am\/p\/J3TyrASEA5\/"
                      },
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/fbcdn-photos-a.akamaihd.net\/hphotos-ak-prn1\/531409_10151582890950430_1191304763_a.jpg"
                            },
                            "message": {
                              "text": "Visiting Amazon."
                            }
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [
                        {
                          "media": {
                            "image": {
                              "uri": "https:\/\/fbcdn-vthumb-a.akamaihd.net\/hvthumb-ak-ash4\/410063_10151577476305430_10151577464650430_19668_1346_t.jpg"
                            },
                            "message": {
                              "text": ""
                            }
                          }
                        }
                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "label": "2011\u5e74",
              "timeline_units": {
                "nodes": [
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": {
                        "text": "To Swiss"
                      },
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "story": {
                      "message": null,
                      "attachments": [

                      ],
                      "actors": [
                        {
                          "id": "562910429",
                          "name": "Hedger Wang",
                          "profile_picture": {
                            "uri": "https:\/\/fbcdn-profile-a.akamaihd.net\/hprofile-ak-snc4\/370864_562910429_1036423046_q.jpg"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    };
    return (new Deferred()).succeed(data);
  }
};

exports.MockData = MockData;