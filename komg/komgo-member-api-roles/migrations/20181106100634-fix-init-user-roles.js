'use strict';

module.exports = {

  up(db) {

    const roles = [
      {
        id: "userAdmin",
        label: "User Admin",
        description: "User Admin",
        permittedActions: [
          {
            product: {
              id: "administration",
              label: "Administration"
            },
            action: {
              id: "manageUsers",
              label: "Manage Users"
            },
            permission: {
              id: "crud",
              label: "Create/Update/Delete"
            }
          },
          {
            product: {
              id: "administration",
              label: "Administration"
            },
            action: {
              id: "manageRoles",
              label: "Manage User Roles"
            },
            permission: {
              id: "crud",
              label: "Create/Update/Delete"
            }
          }
        ]
      },
      {
        id: "kycAnalyst",
        label: "KYC Officer/Manager/Analyst",
        description: "KYC Analyst",
        permittedActions: [
          {
            product: {
              id: "kyc",
              label: "KYC"
            },
            action: {
              id: "manageDocReqTemp",
              label: "Manage Document Request Template"
            }
          },
          {
            product: {
              id: "kyc",
              label: "KYC"
            },
            action: {
              id: "requestDoc",
              label: "Request Document"
            },
            permission: {
              id: "readRequest",
              label: "readRequest"
            }
          },
          {
            product: {
              id: "kyc",
              label: "KYC"
            },
            action: {
              id: "reviewDoc",
              label: "Review Document"
            }
          }
        ]
      },
      {
        id: "complianceOfficer",
        label: "Compliance Officer/Manager/Analyst",
        description: "Compliance Officer",
        permittedActions: [
          {
            product: {
              id: "kyc",
              label: "KYC"
            },
            action: {
              id: "manageDoc",
              label: "Manage Document"
            },
            permission: {
              id: "crudAndShare",
              label: "Register/Share/Update/Delete"
            }
          },
          {
            product: {
              id: "kyc",
              label: "KYC"
            },
            action: {
              id: "manageDocRequest",
              label: "Manage Document Request"
            },
            permission: {
              id: "crudAndShare",
              label: "Register/Share/Update/Delete"
            }
          }
        ]
      },
      {
        id: "tradeFinanceOfficer",
        label: "Trade Finance Officer/Manager/Analyst",
        description: "Trade Finance Officer",
        permittedActions: [
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "manageTrades",
              label: "Manage Trades"
            },
            permission: {
              id: "crud",
              label: "Create/Update/Delete"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "manageLCRequest",
              label: "Manage L/C request"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewIssuedLC",
              label: "Review issued LC"
            },
            permission: {
              id: "crud",
              label: "Create/Update/Delete"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "manageCollection",
              label: "Manage Collection"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "manageDoc",
              label: "Manage Document"
            },
            permission: {
              id: "crudAndShare",
              label: "Register/Share/Update/Delete"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "managePresentation",
              label: "Manage Presentation"
            }
          }
        ]
      },
      {
        id: "relationshipManager",
        label: "Relationship Manager",
        description: "Relationship Manager",
        permittedActions: [
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewLCApplication",
              label: "Review LC application"
            },
            permission: {
              id: "readWrite",
              label: "ReadWrite"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewIssuedLC",
              label: "Review issued LC"
            },
            permission: {
              id: "readWrite",
              label: "ReadWrite"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewPresentation",
              label: "Review Presentation"
            },
            permission: {
              id: "readWrite",
              label: "ReadWrite"
            }
          },
          {
            product: {
              id: "coverage",
              label: "Counterparty management"
            },
            action: {
              id: "manageCoverage",
              label: "Manage Coverage"
            },
            permission: {
              id: "crud",
              label: "Create/Update/Delete"
            }
          }
        ]
      },
      {
        id: "middleAndBackOfficer",
        label: "Middle/ Back Officer",
        description: "Middle/Back Officer",
        permittedActions: [
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewLCApplication",
              label: "Review LC application"
            },
            permission: {
              id: "read",
              label: "Read"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewIssuedLC",
              label: "Review issued LC"
            },
            permission: {
              id: "read",
              label: "Read"
            }
          },
          {
            product: {
              id: "tradeFinance",
              label: "Trade Finance"
            },
            action: {
              id: "reviewPresentation",
              label: "Review Presentation"
            },
            permission: {
              id: "read",
              label: "Read"
            }
          }
        ]
      }
    ]

    const updateRolesPromiseArr = roles.map((role) => {

      return db.collection('roles').replaceOne(
        {id: role.id},
        role,
        { upsert: true })
    })

    return Promise.all(updateRolesPromiseArr)

  },

  down(db, next) {
    // TODO write the statements to rollback your migration (if possible)
    next();
  }

};