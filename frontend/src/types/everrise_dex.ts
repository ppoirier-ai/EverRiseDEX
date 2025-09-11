/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/everrise_dex.json`.
 */
export type EverriseDex = {
  "address": "9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy",
  "metadata": {
    "name": "everriseDex",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "applyDailyBoostManual",
      "docs": [
        "Manually apply daily boost (for testing and maintenance)"
      ],
      "discriminator": [
        135,
        97,
        225,
        107,
        101,
        3,
        45,
        240
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "bumpBuyTail",
      "docs": [
        "Bump buy_queue_tail by 1 to skip an occupied PDA"
      ],
      "discriminator": [
        182,
        96,
        197,
        80,
        212,
        144,
        53,
        86
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "bumpSellTail",
      "docs": [
        "Bump sell_queue_tail by 1 to skip an occupied sell_order PDA"
      ],
      "discriminator": [
        208,
        132,
        217,
        107,
        235,
        46,
        63,
        124
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "buy",
      "docs": [
        "Buy EVER tokens using USDC from the bonding curve. This is now an atomic operation."
      ],
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userUsdcAccount",
          "writable": true
        },
        {
          "name": "userEverAccount",
          "writable": true
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "programEverAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "usdcAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buySmart",
      "docs": [
        "Smart buy that processes sell orders first, then buys from reserves if needed"
      ],
      "discriminator": [
        85,
        223,
        169,
        197,
        95,
        143,
        27,
        132
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userUsdcAccount",
          "writable": true
        },
        {
          "name": "userEverAccount",
          "writable": true
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "programEverAccount",
          "writable": true
        },
        {
          "name": "sellOrder"
        },
        {
          "name": "sellerUsdcAccount"
        },
        {
          "name": "referrer"
        },
        {
          "name": "referrerUsdcAccount"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "usdcAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyRefund",
      "docs": [
        "Emergency refund function - refunds USDC to buyer if transaction fails",
        "This is a safety mechanism to prevent USDC loss"
      ],
      "discriminator": [
        188,
        73,
        52,
        195,
        137,
        70,
        180,
        147
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "buyOrder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.buy_queue_head",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "programUsdcAccount",
          "writable": true
        },
        {
          "name": "buyerUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "getVersion",
      "docs": [
        "Get smart contract version for debugging"
      ],
      "discriminator": [
        168,
        85,
        244,
        45,
        81,
        56,
        130,
        50
      ],
      "accounts": [],
      "args": [],
      "returns": "u32"
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the EverRise DEX with initial bonding curve parameters"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "treasuryWallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "processBuyQueue",
      "docs": [
        "Process buy orders from the queue with partial fill support and transaction safety"
      ],
      "discriminator": [
        27,
        219,
        137,
        135,
        14,
        221,
        3,
        217
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "buyOrder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.buy_queue_head",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "sellOrder"
        },
        {
          "name": "programUsdcAccount",
          "writable": true
        },
        {
          "name": "programEverAccount",
          "writable": true
        },
        {
          "name": "buyerEverAccount",
          "writable": true
        },
        {
          "name": "sellerUsdcAccount"
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "processSellQueue",
      "docs": [
        "Process sell orders from the queue - handles matching with buy orders or direct processing"
      ],
      "discriminator": [
        235,
        78,
        232,
        34,
        50,
        67,
        229,
        211
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "sellOrder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  108,
                  108,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "bonding_curve.sell_queue_head",
                "account": "bondingCurve"
              }
            ]
          }
        },
        {
          "name": "programEverAccount",
          "writable": true
        },
        {
          "name": "sellerUsdcAccount",
          "writable": true
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "burnEverAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "sell",
      "docs": [
        "Sell EVER tokens to the queue system with enhanced transaction safety"
      ],
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "sellOrder",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userEverAccount",
          "writable": true
        },
        {
          "name": "programEverAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "everAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "skipOrphanedBuyOrders",
      "docs": [
        "Skip orphaned buy order accounts (emergency function)"
      ],
      "discriminator": [
        83,
        140,
        198,
        115,
        8,
        227,
        133,
        13
      ],
      "accounts": [
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "docs": [
            "Anyone can call this function to skip orphaned accounts"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "buyOrder",
      "discriminator": [
        227,
        11,
        110,
        187,
        37,
        80,
        95,
        121
      ]
    },
    {
      "name": "sellOrder",
      "discriminator": [
        125,
        28,
        219,
        150,
        25,
        64,
        250,
        236
      ]
    }
  ],
  "events": [
    {
      "name": "atomicBuyEvent",
      "discriminator": [
        61,
        41,
        17,
        222,
        50,
        72,
        113,
        104
      ]
    },
    {
      "name": "buyProcessedEvent",
      "discriminator": [
        49,
        249,
        147,
        191,
        103,
        88,
        214,
        155
      ]
    },
    {
      "name": "buyQueueEvent",
      "discriminator": [
        91,
        157,
        77,
        50,
        47,
        80,
        247,
        165
      ]
    },
    {
      "name": "dailyBoostEvent",
      "discriminator": [
        241,
        202,
        213,
        104,
        81,
        101,
        241,
        61
      ]
    },
    {
      "name": "emergencyRefundEvent",
      "discriminator": [
        241,
        138,
        170,
        187,
        139,
        82,
        188,
        127
      ]
    },
    {
      "name": "sellProcessedEvent",
      "discriminator": [
        253,
        169,
        151,
        11,
        0,
        11,
        185,
        2
      ]
    },
    {
      "name": "sellQueueEvent",
      "discriminator": [
        176,
        33,
        249,
        113,
        155,
        68,
        25,
        185
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6003,
      "name": "queueEmpty",
      "msg": "Queue is empty"
    },
    {
      "code": 6004,
      "name": "amountTooLarge",
      "msg": "Transaction amount too large"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6006,
      "name": "invalidBuyer",
      "msg": "Invalid buyer address"
    },
    {
      "code": 6007,
      "name": "refundNotReady",
      "msg": "Transaction not ready for refund"
    },
    {
      "code": 6008,
      "name": "priceCalculationFailed",
      "msg": "Price calculation failed"
    },
    {
      "code": 6009,
      "name": "insufficientLiquidity",
      "msg": "Insufficient liquidity"
    }
  ],
  "types": [
    {
      "name": "atomicBuyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "everReceived",
            "type": "u64"
          },
          {
            "name": "newPrice",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasuryWallet",
            "type": "pubkey"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "y",
            "type": "u64"
          },
          {
            "name": "k",
            "type": "u128"
          },
          {
            "name": "lastDailyBoost",
            "type": "i64"
          },
          {
            "name": "totalVolume24h",
            "type": "u64"
          },
          {
            "name": "sellQueueHead",
            "type": "u64"
          },
          {
            "name": "sellQueueTail",
            "type": "u64"
          },
          {
            "name": "buyQueueHead",
            "type": "u64"
          },
          {
            "name": "buyQueueTail",
            "type": "u64"
          },
          {
            "name": "cumulativeBonus",
            "type": "u64"
          },
          {
            "name": "currentPrice",
            "type": "u64"
          },
          {
            "name": "lastPriceUpdate",
            "type": "i64"
          },
          {
            "name": "dailyBoostApplied",
            "type": "bool"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "buyOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "expectedTokens",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "processed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "buyProcessedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "everTokens",
            "type": "u64"
          },
          {
            "name": "queueTransactions",
            "type": "u64"
          },
          {
            "name": "reserveTransactions",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "buyQueueEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "estimatedTokens",
            "type": "u64"
          },
          {
            "name": "queuePosition",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "dailyBoostEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organicPrice",
            "type": "u64"
          },
          {
            "name": "minimumPrice",
            "type": "u64"
          },
          {
            "name": "finalPrice",
            "type": "u64"
          },
          {
            "name": "daysPassed",
            "type": "i64"
          },
          {
            "name": "boostAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "emergencyRefundEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "timeElapsed",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sellOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "everAmount",
            "type": "u64"
          },
          {
            "name": "remainingAmount",
            "type": "u64"
          },
          {
            "name": "lockedPrice",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "processed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "sellProcessedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "everAmount",
            "type": "u64"
          },
          {
            "name": "usdcAmount",
            "type": "u64"
          },
          {
            "name": "lockedPrice",
            "type": "u64"
          },
          {
            "name": "processingType",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sellQueueEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "everAmount",
            "type": "u64"
          },
          {
            "name": "lockedPrice",
            "type": "u64"
          },
          {
            "name": "queuePosition",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
