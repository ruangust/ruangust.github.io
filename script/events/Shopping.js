/**
 * Events that can occur when the Shopping module is active
 **/
Events.Shopping = [{
        title: 'Achou algo',
        isAvailable: function() {
            return Engine.activeModule == Shopping && $SM.get('stores.bateria', true) > 0;
        },
        scenes: {
            'start': {
                text: [
                    'Voce encontrou algumas baterias ',
                    "Parece que voce esta com sorte ;)"
                ],
                notification: 'Parece que voce esta com sorte, voce encontrou algumas baterias',
                buttons: {
                    'Pegarbaterias': {
                        text: 'Pegar baterias',
                        reward: { 'bateria': 5 },
                        nextScene: 'end'
                    },
                    'Naopegar': {
                        text: 'Não pegar',
                        nextScene: 'end'
                    }
                }
            }
        }
    }, {
        title: 'Parece um estabelecimento.',
        isAvailable: function() {
            return Engine.activeModule == Shopping;
        },
        scenes: {
            'start': {
                text: [
                    'Lojas como essa possuem vastas prateleiras com suprimentos, que podem ajudar na jornada.',
                    "Porém a porta parece estar emperrada"
                ],
                notification: 'Lojas como essa possuem vastas prateleiras com suprimentos, que podem ajudar na jornada.',
                buttons: {
                    'Arrombarporta': {
                        text: 'Arrombar porta',
                        cost: {
                            'energia': 4
                        },
                        reward: {
                            'tecido': 3,
                            'hamburguer': 3,
                            'bateria': 3
                        },
                        nextScene: 'end'
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                }
            }
        }
    }, {
        title: 'Parece uma saida.',
        isAvailable: function() {
            return Engine.activeModule == Shopping && $SM.get('stores.tecido', true) > 0
        },
        scenes: {
            'start': {
                text: [
                    'Parece que achamos uma Saida!',
                    "Mas a escada parece quebrada, precisamos de algo para descer"
                ],
                notification: 'Parece que achamos uma Saida!',
                buttons: {

                    'UtilizarEscada': {
                        text: 'Utilizar Escada',
                        cost: { 'escada': 1 },
                        nextScene: 'acabou'
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                },
            },
            'acabou': {
                text: [
                    'Parece que você conseguiu fugir',
                    'Deseja jogar novamente?'
                ],
                buttons: {
                    'sim': {
                        text: 'Sim',
                        nextScene: 'end',
                        onChoose: Engine.deleteSave
                    },
                    'nao': {
                        text: 'Não',
                        nextScene: 'end'
                    }
                }
            },
        }
    },
    {
        title: 'Parece uma saida.',
        isAvailable: function() {
            return Engine.activeModule == Shopping && $SM.get('stores.tecido', true) > 0
        },
        scenes: {
            'start': {
                text: [
                    'Parece que achamos uma Saida!',
                    "Mas a escada parece quebrada, precisamos de algo para descer"
                ],
                notification: 'Parece que achamos uma Saida!',
                buttons: {

                    'UtilizarEscada': {
                        text: 'Utilizar Escada',
                        cost: { 'escada': 1 },
                        nextScene: { 1: 'acabou' }
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                },
            },
            'acabou': {
                text: [
                    'Parece que você conseguiu fugir',
                    'Deseja jogar novamente?'
                ],
                buttons: {
                    'sim': {
                        text: 'Sim',
                        nextScene: 'end',
                        onChoose: Engine.deleteSave
                    },
                    'nao': {
                        text: 'Não',
                        nextScene: 'end'
                    }
                }
            },
        }
    },
    {
        title: 'Parece uma saida.',
        isAvailable: function() {
            return Engine.activeModule == Shopping && $SM.get('stores.tecido', true) > 0
        },
        scenes: {
            'start': {
                text: [
                    'Parece que achamos uma Saida!',
                    "Mas a escada parece quebrada, precisamos de algo para descer"
                ],
                notification: 'Parece que achamos uma Saida!',
                buttons: {

                    'UtilizarEscada': {
                        text: 'Utilizar Escada',
                        cost: { 'escada': 1 },
                        nextScene: 'acabou'
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                },
            },
            'acabou': {
                text: [
                    'Parece que você conseguiu fugir',
                    'Deseja jogar novamente?'
                ],
                buttons: {
                    'sim': {
                        text: 'Sim',
                        nextScene: 'end',
                        onChoose: Engine.deleteSave
                    },
                    'nao': {
                        text: 'Não',
                        nextScene: 'end'
                    }
                }
            },
        }
    }, {
        title: 'Parece um estabelecimento.',
        isAvailable: function() {
            return Engine.activeModule == Shopping;
        },
        scenes: {
            'start': {
                text: [
                    'Lojas como essa possuem vastas prateleiras com suprimentos, que podem ajudar na jornada.'
                ],
                notification: 'Lojas como essa possuem vastas prateleiras com suprimentos, que podem ajudar na jornada.',
                buttons: {
                    'VerificarPrateleiras': {
                        text: 'Verificar Prateleiras',
                        nextScene: { 0.4: 'Achoualgo', 0.6: 'Nada' }
                    },
                    'IgnorarLoja': {
                        text: 'Ignorar Loja',
                        nextScene: 'end'
                    }
                }
            },
            'Nada': {
                text: [
                    'Você não achou absolutamente nada',
                    'Aparentemente voocê esta com má sorte'
                ],
                buttons: {
                    'SairdaLoja': {
                        text: 'Sair da Loja',
                        nextScene: 'end'
                    }
                }
            },
            'Achoualgo': {
                reward: { bateria: 5, hamburguer: 2, tecido: 4 },
                text: [
                    'Há suprimentos na loja, estão ao alcance de suas mãos.'
                ],
                buttons: {
                    'SairdaLoja': {
                        text: 'Sair da Loja',
                        nextScene: 'end'
                    }
                }
            }

        }
    }, {
        title: 'Parece um estabelecimento.',
        isAvailable: function() {
            return Engine.activeModule == Shopping;
        },
        scenes: {
            'start': {
                text: [
                    'Há uma porta mais a frente. Parece ser outra loja.',
                    "A porta parece estar emperrada"
                ],
                notification: 'Há uma porta mais a frente. Parece ser outra loja.',
                buttons: {
                    'Arrombarporta': {
                        text: 'Arrombar porta',
                        notification: 'As prateleiras estão recheadas, mas não parece o bastante.',
                        cost: {
                            'energia': 4
                        },
                        reward: {
                            'tecido': 3,
                            'hamburguer': 3,
                            'bateria': 3
                        },
                        nextScene: 'end'
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                }
            }
        }
    }, {
        title: 'Parece um estabelecimento.',
        isAvailable: function() {
            return Engine.activeModule == Shopping;
        },
        scenes: {
            'start': {
                text: [
                    'Há um barulho estranho vindo de uma lixeira.'
                ],
                notification: 'Há um barulho estranho vindo de uma lixeira.',
                buttons: {
                    'VerificarLixeira': {
                        text: 'Verificar Lixeira',
                        nextScene: { 0.4: 'Achoualgo', 0.6: 'Nada' }
                    },
                    'IgnorarLoja': {
                        text: 'Ignorar Loja',
                        nextScene: 'end'
                    }
                }
            },
            'Nada': {
                text: [
                    'Você não achou absolutamente nada',
                    'Isso deve ser um alivio?'
                ],
                buttons: {
                    'SairdaLoja': {
                        text: 'Sair da Loja',
                        nextScene: 'end'
                    }
                },
            },
            'Achoualgo': {
                reward: { bateria: 5, hamburguer: 2, tecido: 4 },
                text: [
                    'Uhuu! você está com sorte :)'
                ],
                buttons: {
                    'SairdaLoja': {
                        text: 'Sair da Loja',
                        nextScene: 'end'
                    }
                }
            }

        }
    }, {
        title: 'Você achou alguns hamburguers',
        isAvailable: function() {
            return Engine.activeModule == Shopping
        },
        scenes: {
            'start': {
                text: [
                    'Você achou alguns hamburguers'
                ],
                notification: 'Você achou alguns hamburguers',
                buttons: {
                    'PegarHamburguer': {
                        text: 'Pegar Hamburguers',
                        reward: {
                            'hamburguer': 3,
                        },
                        nextScene: 'end'
                    },
                    'Fechar': {
                        text: 'Fechar',
                        nextScene: 'end'
                    }
                }
            }
        }
    },
];