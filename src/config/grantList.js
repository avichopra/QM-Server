const ROLES = require('./roles');

const grantList = {
  [ROLES.PATIENT]: {
    User: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: { _id: '=currentUser' },
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_own: {
        filter: { _id: '=currentUser._id' },
        allowedFields: ['*'],
        deniedFields: [],
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
        $unset: {
          allowedFields: ['contactNo']
        }
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    BloodBank: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    Requests: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      create_own: {
        setter: { user: '=currentUser._id' },
        allowedFields: ['*'],
        deniedFields: []
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    Patient: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    },
    Trips: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    RequestHandler: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    Driver: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    }
  },
  [ROLES.DRIVER]: {
    User: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: { _id: '=currentUser' },
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_own: {
        filter: { _id: '=currentUser._id' },
        allowedFields: ['*'],
        deniedFields: [],
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
        $unset: {
          allowedFields: ['contactNo']
        }
      }
    },
    BloodBank: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    RequestHandler: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    Trips: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    },
    Driver: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    },
    Patient: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    },
    Ambulance: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    },
    AssignAmbulance: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      }
    }
  },
  [ROLES.ADMIN]: {
    User: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: { _id: '=currentUser' },
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      create_own: {
        setter: { status: true, role: ROLES.DRIVER, emailVerified: true },
        allowedFields: ['fullname', 'contactNo', 'email', 'password']
        // deniedFields: ["user"]
      },
      update_any: {
        filter: {},
        allowedFields: ['status', 'fullname', 'email', 'contactNo', 'deviceId'],
        $unset: {
          allowedFields: ['deviceId']
        }
      },
      update_own: {
        filter: { _id: '=currentUser' },
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      }
    },
    Driver: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      }
    },
    RequestHandler: {
      read_any: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["password"]
      },
      read_own: {
        filter: {},
        allowedFields: ['*']
        // deniedFields: ["services",]
      },
      update_any: {
        filter: {},
        allowedFields: ['*'],
        deniedFields: []
        // $pop: {
        //   allowedFields: ["*"]
        // },
        // $pull: {
        //   allowedFields: ["location", "grades"]
        // },
      }
    },
    Patient: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      }
    },
    Ambulance: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      create_own: {
        setter: { status: true },
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      }
    },
    BloodBank: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      },
      create_own: {
        // setter: { status: true },
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      }
    },
    AssignAmbulance: {
      read_any: {
        filter: { deleted: false },
        allowedFields: ['*']
      },
      remove_any: {
        filter: {}
      },
      create_own: {
        setter: { status: true, deleted: false },
        allowedFields: ['*']
      },
      update_any: {
        filter: {},
        allowedFields: ['*']
      }
    },
    Trips: {
      read_any: {
        filter: {},
        allowedFields: ['*']
      }
    }
    // Customer: {
    //   read_any: {
    //     filter: {},
    //     allowedFields: ["*"],
    //     deniedFields: ["email"]
    //   },
    //   read_own: {
    //     filter: { _id: "=currentUser.customer" },
    //     allowedFields: ["*"],
    //     deniedFields: ["email"]
    //   },
    //   create_own: {
    //     setter: { user: "=currentUser._id" },
    //     allowedFields: ["*"],
    //     deniedFields: ["user"]
    //   },
    //   remove_any: {
    //     filter: {}
    //   },
    //   remove_own: {
    //     filter: { user: "=currentUser._id" },
    //     allowedFields: ["*"]
    //   },
    //   update_any: {
    //     filter: {},
    //     allowedFields: ["*"],
    //     deniedFields: ["address.country.name"],
    //     $pop: {
    //       allowedFields: ["*"]
    //     },
    //     $pull: {
    //       allowedFields: ["location", "grades"]
    //     },
    //     $unset: {
    //       allowedFields: ["address.city"]
    //     }
    //   },
    //   update_own: {
    //     filter: { user: "=currentUser._id" },
    //     allowedFields: ["*"],
    //     deniedFields: ["address.country.name"],
    //     $pop: {
    //       allowedFields: ["*"]
    //     },
    //     $pull: {
    //       allowedFields: ["location", "grades"]
    //     },
    //     $unset: {
    //       allowedFields: ["address.city"]
    //     }
    //   }
    // }
  }
  // [ROLES.CUSTOMER]: {
  //   User: {
  //     read_any: {
  //       filter: { _id: { $ne: '=currentUser' } },
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role'],
  //     },
  //     read_own: {
  //       filter: {},
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role', 'services'],
  //     },
  //   },
  // },
  // [ROLES.DEPARTMENT]: {
  //   User: {
  //     read_any: {
  //       filter: { _id: { $ne: '=currentUser' } },
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role'],
  //     },
  //     read_own: {
  //       filter: {},
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role'],
  //     },
  //   },
  // },
  // [ROLES.OFFICER]: {
  //   User: {
  //     read_any: {
  //       filter: { _id: { $ne: '=currentUser' } },
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role'],
  //     },
  //     read_own: {
  //       filter: {},
  //       allowedFields: ['*'],
  //       deniedFields: ['password', 'role'],
  //     },
  //   },
  //   Customer: {
  //     read_any: {
  //       filter: { },
  //       allowedFields: ['*'],
  //       deniedFields: ['email'],
  //     },
  //   },
  // },
};

module.exports = grantList;
